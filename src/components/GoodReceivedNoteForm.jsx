"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Globe, Link2, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { createNotification } from '@/lib/notificationService';
import { sendNotificationEmail } from '@/lib/emailService';

export default function GoodReceivedNoteForm({ onSuccess }) {
  const [items, setItems] = useState(Array.from({ length: 15 }, (_, i) => ({ id: i })));
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cascade: Pending PO list
  const [pendingPOs, setPendingPOs] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [isLoadingPOs, setIsLoadingPOs] = useState(false);
  const formRef = useRef(null);
  const [grnNumber, setGrnNumber] = useState('...');

  const fetchGrnNumber = async () => {
    try {
      const q = query(collection(db, 'submissions'), where('formId', '==', 'grn'));
      const snapshot = await getCountFromServer(q);
      const nextNum = snapshot.data().count + 1;
      setGrnNumber(`GRN-${nextNum.toString().padStart(4, '0')}`);
    } catch (err) {
      console.error('Error fetching grn number:', err);
      setGrnNumber('ERROR');
    }
  };

  // Fetch pending POs on mount
  useEffect(() => {
    const fetchPendingPOs = async () => {
      setIsLoadingPOs(true);
      try {
        const q = query(
          collection(db, 'submissions'),
          where('formId', '==', 'measurement'),
          where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setPendingPOs(data);
      } catch (error) {
        console.error('Error fetching pending POs:', error);
      } finally {
        setIsLoadingPOs(false);
      }
    };
    fetchPendingPOs();
    fetchGrnNumber();
  }, []);

  // Auto-fill when a PO is selected
  const handlePOSelect = (poId) => {
    if (!poId) {
      setSelectedPO(null);
      return;
    }
    const po = pendingPOs.find(p => p.id === poId);
    if (!po || !formRef.current) return;
    setSelectedPO(po);

    const form = formRef.current;
    // Fill PO# field
    const poInput = form.querySelector('[name="poNumber"]');
    if (poInput) poInput.value = po.workOrder || '';
    
    // Fill PR details
    const prDetailsInput = form.querySelector('[name="prDetails"]');
    if (prDetailsInput) prDetailsInput.value = po.pr ? `PR# ${po.pr} | ${po.date || ''}` : '';
    
    // Fill GRN date with today
    const dateInput = form.querySelector('[name="grnDate"]');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    
    // Fill supervisor and project if available
    const supervisorInput = form.querySelector('[name="supervisor"]');
    if (supervisorInput && po.vendor) supervisorInput.value = po.vendor || '';
    
    const projectInput = form.querySelector('[name="project"]');
    if (projectInput) projectInput.value = po.cs || '';
    
    // Map PO items to GRN items
    for (let i = 0; i < 15; i++) {
      const categoryInput = form.querySelector(`[name="item_category_${i}"]`);
      const detailsInput = form.querySelector(`[name="item_details_${i}"]`);
      const orderedQtyInput = form.querySelector(`[name="item_orderedQty_${i}"]`);
      
      if (detailsInput) detailsInput.value = po[`item_desc_${i}`] || '';
      if (orderedQtyInput) orderedQtyInput.value = po[`item_qty_${i}`] || '';
      if (categoryInput) categoryInput.value = po[`item_number_${i}`] || '';
    }

    toast.info(`PO/WO# ${po.workOrder || 'N/A'} data loaded into form.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData(e.target);
      const payload = Object.fromEntries(data.entries());
      payload.formId = 'grn';
      payload.submittedAt = new Date().toISOString();
      payload.submittedBy = user?.email || 'Unknown';
      
      // Cascade fields
      payload.status = 'completed';
      payload.createdByEmail = user?.email || '';
      payload.assignedToRole = 'Admin';
      payload.linkedPOId = selectedPO?.id || '';
      
      const docRef = await addDoc(collection(db, 'submissions'), payload);
      
      // If linked to a PO, mark the PO as completed
      if (selectedPO?.id) {
        await updateDoc(doc(db, 'submissions', selectedPO.id), { status: 'completed' });
        
        // Notify the original PO submitter
        if (selectedPO.createdByEmail) {
          await createNotification({
            recipientRole: '__all__',
            recipientUserId: null,
            message: `Your Work Order (WO# ${selectedPO.workOrder || 'N/A'}) has been received and a GRN has been created by ${user?.name || user?.email}.`,
            relatedDocId: docRef.id,
            relatedFormType: 'grn',
          });

          await sendNotificationEmail(
            selectedPO.createdByEmail,
            'Your PO Has Been Received - GRN Created',
            `Your Work Order (WO# ${selectedPO.workOrder || 'N/A'}) has been received and a Good Received Note (GRN) has been created by ${user?.name || user?.email}.`
          );
        }
      }
      
      // Create notification for Admin
      await createNotification({
        recipientRole: 'Admin',
        message: `New GRN (GRN# ${payload.grnNumber || 'N/A'}) created by ${user?.name || user?.email}. Goods received for PO# ${payload.poNumber || 'N/A'}.`,
        relatedDocId: docRef.id,
        relatedFormType: 'grn',
      });

      // Send email notification
      await sendNotificationEmail(
        '',
        'New GRN Created - Goods Received',
        `A new Good Received Note (GRN# ${payload.grnNumber || 'N/A'}) has been created by ${user?.name || user?.email}. Goods have been received for PO# ${payload.poNumber || 'N/A'}.`
      );

      toast.success('Good Received Note submitted successfully!');
      e.target.reset();
      setSelectedPO(null);
      fetchGrnNumber();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Error submitting form: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white text-black font-sans pb-4" ref={formRef}>

      {/* PO Linking Dropdown */}
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl print:hidden">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-extrabold text-emerald-900 uppercase tracking-wider">Link to Pending Work Order</h3>
        </div>
        <div className="relative">
          <select
            onChange={(e) => handlePOSelect(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-emerald-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all appearance-none cursor-pointer"
            defaultValue=""
          >
            <option value="">— Select a Pending Work Order (Optional) —</option>
            {isLoadingPOs ? (
              <option disabled>Loading pending Work Orders...</option>
            ) : pendingPOs.length === 0 ? (
              <option disabled>No pending Work Orders available</option>
            ) : (
              pendingPOs.map(po => (
                <option key={po.id} value={po.id}>
                  WO# {po.workOrder || 'N/A'} | {po.vendor || 'No Vendor'} | PR# {po.pr || 'N/A'} | {new Date(po.submittedAt).toLocaleDateString()}
                </option>
              ))
            )}
          </select>
          <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {selectedPO && (
          <p className="mt-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg inline-block">
            ✓ Linked to WO# {selectedPO.workOrder || 'N/A'} — submitted by {selectedPO.submittedBy || 'Unknown'}
          </p>
        )}
      </div>

      {/* Wrapping the table in a horizontal scroll container */}
      <div className="w-full overflow-x-auto pb-4">
         <div className="min-w-[900px] flex flex-col bg-white" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
            
            {/* Top Header Section (No outer border) */}
            <div className="flex flex-row mb-2">
               {/* Logo Area */}
               <div className="w-[40%] flex flex-col justify-end p-2 pb-0">
                  <div className="flex items-end gap-2">
                     <div className="w-[70px] h-[70px] flex items-center justify-center relative flex-shrink-0">
                        <img src="/logo.png" alt="Unicorn Logo" className="w-full h-full object-contain" />
                     </div>
                     <div className="ml-1 pb-1">
                        <h1 className="text-[22px] font-serif text-slate-800 italic tracking-tighter uppercase leading-none" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                           UNICORN INTERNATIONAL
                        </h1>
                     </div>
                  </div>
               </div>
               
               {/* PO # Area */}
               <div className="w-[20%] flex flex-col justify-end px-2">
                  <div className="border border-black border-b-0 text-center text-[13px] p-0.5 font-medium">PO#</div>
                  <div className="border border-black h-[30px] p-0">
                     <input name="poNumber" required type="text" className="w-full h-full outline-none text-center px-1 font-semibold" />
                  </div>
                  <div className="text-[12px] text-center bg-gray-200 mt-1">Office Use Only</div>
               </div>

               {/* PR # and PR Date Area */}
               <div className="w-[40%] flex flex-col justify-end pl-10 pr-4 pb-5">
                  <div className="border border-black border-b-0 text-center text-[13px] p-0.5 font-medium">PR # and PR Date</div>
                  <div className="border border-black h-[30px] p-0">
                     <input name="prDetails" required type="text" className="w-full h-full outline-none text-center px-1 text-[13px] font-semibold" />
                  </div>
               </div>
            </div>

            {/* The Grid Table Box */}
            <div className="border-[2px] border-black flex flex-col">
               
               {/* Title Row with Date and GRN# */}
               <div className="flex flex-row border-b-[2px] border-black h-[35px] items-center justify-center">
                  <div className="w-[15%] flex flex-row border-r-[1px] border-black h-full">
                     <div className="w-[40%] flex items-center justify-center border-r-[1px] border-black font-[500] text-[13px]">Date</div>
                     <div className="w-[60%] p-0">
                        <input name="grnDate" required type="date" className="w-full h-full outline-none px-1 text-[12px] uppercase font-semibold" />
                     </div>
                  </div>
                  <div className="w-[65%] flex items-center justify-center h-full">
                     <h2 className="font-bold text-[18px]">Good Reieved Note (GRN)</h2>
                  </div>
                  <div className="w-[20%] flex flex-row border-l-[1px] border-black h-full">
                     <div className="w-[40%] flex items-center justify-center border-r-[1px] border-black font-[500] text-[13px]">GRN#</div>
                     <div className="w-[60%] p-0 bg-slate-50">
                        <input name="grnNumber" value={grnNumber} readOnly required type="text" className="w-full h-full outline-none px-1 font-bold text-[13px] text-center bg-transparent text-slate-500 cursor-not-allowed" />
                     </div>
                  </div>
               </div>

               {/* Supervisor & Project */}
               <div className="flex flex-col border-b-[2px] border-black">
                  <div className="flex flex-row border-b-[1px] border-black h-[30px]">
                     <div className="w-[15%] flex items-center px-2 border-r-[1px] border-black font-[500] text-[13px]">
                        Supervisor
                     </div>
                     <div className="w-[85%] p-0">
                        <input name="supervisor" required type="text" className="w-full h-full outline-none px-2 font-semibold text-[13px]" />
                     </div>
                  </div>
                  <div className="flex flex-row h-[30px]">
                     <div className="w-[15%] flex items-center px-2 border-r-[1px] border-black font-[500] text-[13px]">
                        Project
                     </div>
                     <div className="w-[85%] p-0">
                        <input name="project" required type="text" className="w-full h-full outline-none px-2 font-semibold text-[13px]" />
                     </div>
                  </div>
               </div>

               {/* Grid Header */}
               <div className="flex flex-row border-b-[2px] border-black text-[13px] font-bold">
                  <div className="w-[12%] flex items-center justify-center border-r-[1px] border-black p-1 text-center">
                     Cost Center
                  </div>
                  <div className="w-[20%] flex items-center justify-center border-r-[1px] border-black p-1 text-center">
                     Category
                  </div>
                  <div className="w-[46%] flex items-center justify-center border-r-[1px] border-black p-1 text-center">
                     Item details
                  </div>
                  <div className="w-[11%] flex items-center justify-center border-r-[1px] border-black p-1 text-center leading-tight">
                     Ordered QTY
                  </div>
                  <div className="w-[11%] flex items-center justify-center p-1 text-center leading-tight">
                     Delivered QTY
                  </div>
               </div>

               {/* Grid Rows */}
               <div className="flex flex-col border-b-[2px] border-black">
                  {items.map((item, idx) => (
                     <div key={idx} className="flex flex-row border-b-[1px] border-black last:border-b-0 h-[30px] hover:bg-slate-100 transition-colors">
                        <div className="w-[12%] border-r-[1px] border-black p-0">
                           <input name={`item_costCenter_${idx}`} type="text" className="w-full h-full outline-none bg-transparent px-2 text-[13px] text-center" />
                        </div>
                        <div className="w-[20%] border-r-[1px] border-black p-0">
                           <input name={`item_category_${idx}`} type="text" className="w-full h-full outline-none bg-transparent px-2 text-[13px]" />
                        </div>
                        <div className="w-[46%] border-r-[1px] border-black p-0">
                           <input name={`item_details_${idx}`} type="text" className="w-full h-full outline-none bg-transparent px-2 text-[13px]" />
                        </div>
                        <div className="w-[11%] border-r-[1px] border-black p-0">
                           <input name={`item_orderedQty_${idx}`} type="number" className="w-full h-full outline-none bg-transparent px-1 text-[13px] text-center" />
                        </div>
                        <div className="w-[11%] p-0">
                           <input name={`item_deliveredQty_${idx}`} type="number" className="w-full h-full outline-none bg-transparent px-1 text-[13px] text-center" />
                        </div>
                     </div>
                  ))}
               </div>

               {/* Footer */}
               <div className="flex flex-row h-[45px]">
                  <div className="w-[12%] flex items-center justify-center border-r-[1px] border-black text-[12px] font-medium p-1">
                     Required By
                  </div>
                  <div className="w-[20%] border-r-[1px] border-black p-0">
                     <input name="requiredBy" type="text" className="w-full h-full outline-none px-2" />
                  </div>
                  <div className="w-[15%] flex items-center justify-center border-r-[1px] border-black text-[12px] font-medium p-1">
                     Received By
                  </div>
                  <div className="w-[31%] border-r-[1px] border-black p-0">
                     <input name="receivedBy" type="text" className="w-full h-full outline-none px-2" />
                  </div>
                  <div className="w-[11%] border-r-[1px] border-black p-0"></div>
                  <div className="w-[11%] p-0"></div>
               </div>
            </div>
         </div>
      </div>
      
      {/* Submit */}
      <div className="mt-4 flex justify-end px-4 md:px-0 gap-4 print:hidden">
         <button type="button" onClick={() => window.print()} className="px-8 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold tracking-wide uppercase text-sm rounded transition-all">
            Print
         </button>
         <button disabled={isSubmitting} type="submit" className="px-8 py-2.5 bg-[#0B1121] hover:bg-[#0052FF] text-white font-bold tracking-wide uppercase text-sm rounded transition-all disabled:opacity-70">
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
         </button>
      </div>
    </form>
  );
}
