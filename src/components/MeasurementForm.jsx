"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Globe, Link2, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { createNotification, fetchEmailByRole } from '@/lib/notificationService';
import { sendNotificationEmail } from '@/lib/emailService';

export default function MeasurementForm({ onSuccess }) {
  const [items, setItems] = useState(Array.from({ length: 15 }, (_, i) => ({ id: i })));
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Cascade: Pending PR list
  const [pendingPRs, setPendingPRs] = useState([]);
  const [selectedPR, setSelectedPR] = useState(null);
  const [isLoadingPRs, setIsLoadingPRs] = useState(false);
  const formRef = useRef(null);

  // Fetch pending PRs on mount
  useEffect(() => {
    const fetchPendingPRs = async () => {
      setIsLoadingPRs(true);
      try {
        const q = query(
          collection(db, 'submissions'),
          where('formId', '==', 'requisition'),
          where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setPendingPRs(data);
      } catch (error) {
        console.error('Error fetching pending PRs:', error);
      } finally {
        setIsLoadingPRs(false);
      }
    };
    fetchPendingPRs();
  }, []);

  // Auto-fill when a PR is selected
  const handlePRSelect = (prId) => {
    if (!prId) {
      setSelectedPR(null);
      return;
    }
    const pr = pendingPRs.find(p => p.id === prId);
    if (!pr || !formRef.current) return;
    setSelectedPR(pr);

    const form = formRef.current;
    // Fill PR# field
    const prInput = form.querySelector('[name="pr"]');
    if (prInput) prInput.value = pr.reqNumber || '';
    
    // Fill Vendor (from supervisor if available)
    // Fill date with today
    const dateInput = form.querySelector('[name="date"]');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    
    // Map PR items to PO items (closest matching fields)
    for (let i = 0; i < 15; i++) {
      const qtyInput = form.querySelector(`[name="item_qty_${i}"]`);
      const descInput = form.querySelector(`[name="item_desc_${i}"]`);
      const unitInput = form.querySelector(`[name="item_unit_${i}"]`);
      
      if (qtyInput) qtyInput.value = pr[`item_qty_${i}`] || '';
      if (descInput) descInput.value = pr[`item_details_${i}`] || '';
      if (unitInput) unitInput.value = pr[`item_unit_${i}`] || '';
    }

    toast.info(`PR #${pr.reqNumber || 'N/A'} data loaded into form.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData(e.target);
      const payload = Object.fromEntries(data.entries());
      payload.formId = 'measurement';
      payload.submittedAt = new Date().toISOString();
      payload.submittedBy = user?.email || 'Unknown';
      
      // Cascade fields
      payload.status = 'pending';
      payload.createdByEmail = user?.email || '';
      payload.assignedToRole = 'Store Manager';
      payload.linkedPRId = selectedPR?.id || '';
      
      const docRef = await addDoc(collection(db, 'submissions'), payload);
      
      // If linked to a PR, mark the PR as completed
      if (selectedPR?.id) {
        await updateDoc(doc(db, 'submissions', selectedPR.id), { status: 'completed' });
        
        // Notify the original PR submitter
        if (selectedPR.createdByEmail) {
          await createNotification({
            recipientRole: '__all__',
            recipientUserId: null,
            message: `Your Purchase Requisition (Req# ${selectedPR.reqNumber || 'N/A'}) has been processed into a Work Order by ${user?.name || user?.email}.`,
            relatedDocId: docRef.id,
            relatedFormType: 'measurement',
          });

          await sendNotificationEmail(
            selectedPR.createdByEmail,
            'Your PR Has Been Processed',
            `Your Purchase Requisition (Req# ${selectedPR.reqNumber || 'N/A'}) has been processed into a Work Order by ${user?.name || user?.email}.`
          );
        }
      }
      
      // Create notification for GRN processing
      await createNotification({
        recipientRole: 'Store Manager',
        message: `New Work Order (WO# ${payload.workOrder || 'N/A'}) created by ${user?.name || user?.email}. Please create a GRN when goods are received.`,
        relatedDocId: docRef.id,
        relatedFormType: 'measurement',
      });

      await createNotification({
        recipientRole: 'Admin',
        message: `New Work Order (WO# ${payload.workOrder || 'N/A'}) created by ${user?.name || user?.email}.`,
        relatedDocId: docRef.id,
        relatedFormType: 'measurement',
      });

      // Send email notification dynamically to Store Manager
      const targetEmail = await fetchEmailByRole('Store Manager');
      await sendNotificationEmail(
        targetEmail,
        'New Work Order Generated',
        `A new Work Order (WO# ${payload.workOrder || 'N/A'}) has been created by ${user?.name || user?.email}. Please login to process the GRN when goods arrive.`
      );

      toast.success('Work Order submitted successfully!');
      e.target.reset();
      setSelectedPR(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Error submitting form: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white text-black font-sans pb-4" ref={formRef}>
      
      {/* PR Linking Dropdown */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-2xl print:hidden">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider">Link to Pending Purchase Requisition</h3>
        </div>
        <div className="relative">
          <select
            onChange={(e) => handlePRSelect(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all appearance-none cursor-pointer"
            defaultValue=""
          >
            <option value="">— Select a Pending PR (Optional) —</option>
            {isLoadingPRs ? (
              <option disabled>Loading pending PRs...</option>
            ) : pendingPRs.length === 0 ? (
              <option disabled>No pending PRs available</option>
            ) : (
              pendingPRs.map(pr => (
                <option key={pr.id} value={pr.id}>
                  PR# {pr.reqNumber || 'N/A'} | {pr.supervisor || 'No Supervisor'} | {pr.project || 'No Project'} | {new Date(pr.submittedAt).toLocaleDateString()}
                </option>
              ))
            )}
          </select>
          <ChevronDown className="w-4 h-4 text-blue-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {selectedPR && (
          <p className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
            ✓ Linked to PR# {selectedPR.reqNumber || 'N/A'} — submitted by {selectedPR.submittedBy || 'Unknown'}
          </p>
        )}
      </div>

      {/* Outer Border Box - Colored Blue to match screenshot */}
      <div className="border-2 md:border-[3px] border-[#0052FF] flex flex-col overflow-hidden bg-white">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between p-4 md:p-6 gap-6">
           <div className="flex items-center gap-3">
              <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center relative flex-shrink-0">
                 <img src="/logo.png" alt="Unicorn Logo" className="w-full h-full object-contain" />
              </div>
              <div className="ml-2">
                 <h1 className="text-2xl md:text-[32px] font-serif text-slate-800 italic tracking-tighter uppercase leading-none" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                    Unicorn International
                 </h1>
              </div>
           </div>
           <div className="flex items-end md:items-center justify-center md:justify-end">
              <h2 className="text-[28px] md:text-[34px] font-bold tracking-widest font-serif text-[#0B1121]">WORK ORDER</h2>
           </div>
        </div>

        {/* Top Info Grid */}
        <div className="flex flex-col md:flex-row justify-between px-4 pb-4 gap-6 md:gap-10">
           {/* Left Block */}
           <div className="flex flex-col gap-4 w-full md:w-1/2">
              <div className="flex border-[2px] border-black h-[40px] md:h-[35px]">
                 <div className="w-[120px] px-2 flex items-center text-[12px] font-bold border-r-[2px] border-black uppercase bg-white">WORK ORDER</div>
                 <input name="workOrder" required type="text" className="flex-1 outline-none px-3 text-sm font-semibold bg-white" />
              </div>
              <div className="flex border-[2px] border-black h-[40px] md:h-[35px]">
                 <div className="w-[120px] px-2 flex items-center text-[12px] font-bold border-r-[2px] border-black uppercase bg-white">VENDOR:</div>
                 <input name="vendor" required type="text" className="flex-1 outline-none px-3 text-sm font-semibold bg-white" />
              </div>
           </div>
           {/* Right Block */}
           <div className="flex flex-col gap-2 w-full md:w-[300px]">
              <div className="flex border-[2px] border-black h-[35px] md:h-[30px]">
                 <div className="w-[60px] px-2 flex items-center text-[12px] font-bold border-r-[2px] border-black uppercase bg-white">DATE:</div>
                 <input name="date" required type="date" className="flex-1 outline-none px-2 text-xs font-semibold bg-white uppercase" />
              </div>
              <div className="flex border-[2px] border-black h-[35px] md:h-[30px]">
                 <div className="w-[60px] px-2 flex items-center text-[12px] font-bold border-r-[2px] border-black uppercase bg-white">PR#</div>
                 <input name="pr" type="text" className="flex-1 outline-none px-2 text-xs font-semibold bg-white" />
              </div>
              <div className="flex border-[2px] border-black h-[35px] md:h-[30px]">
                 <div className="w-[60px] px-2 flex items-center text-[12px] font-bold border-r-[2px] border-black uppercase bg-white">CS</div>
                 <div className="flex-1 border-[2px] border-[#4F81BD] bg-[#EBF1DE] flex items-center">
                    <input name="cs" type="text" className="w-full h-full outline-none bg-transparent px-2 text-xs font-semibold" />
                 </div>
              </div>
           </div>
        </div>

        {/* Payment Terms & Completion Time */}
        <div className="flex flex-col border-t-[2px] border-black">
           <div className="flex flex-col md:flex-row border-b-[2px] border-black divide-y-[2px] md:divide-y-0 md:divide-x-[2px] divide-black bg-[#B7DEE8] text-center text-[13px] font-bold">
              <div className="flex-[3] p-1.5 flex items-center justify-center">Payment Terms</div>
              <div className="flex-[1] p-1.5 flex items-center justify-center">Completion Time</div>
           </div>
           <div className="flex flex-col md:flex-row border-b-[2px] border-black divide-y-[2px] md:divide-y-0 md:divide-x-[2px] divide-black text-center text-sm font-semibold bg-white">
              <div className="flex-[3] p-0 h-[45px] md:h-[40px]">
                 <input name="paymentTerms" type="text" className="w-full h-full outline-none px-3 bg-transparent text-center" />
              </div>
              <div className="flex-[1] p-0 h-[45px] md:h-[40px]">
                 <input name="completionTime" type="text" className="w-full h-full outline-none px-3 bg-transparent text-center" />
              </div>
           </div>
        </div>

        {/* Main Grid Header */}
        <div className="hidden md:flex flex-row border-b-[2px] border-black divide-x-[2px] divide-black text-[13px] font-bold text-center bg-[#B7DEE8]">
           <div className="w-[8%] p-2 flex items-center justify-center">Qty</div>
           <div className="w-[12%] p-2 flex items-center justify-center">Item #</div>
           <div className="w-[45%] p-2 flex items-center justify-center">Description</div>
           <div className="w-[10%] p-2 flex items-center justify-center">Unit</div>
           <div className="w-[12%] p-2 flex items-center justify-center">Unit Price</div>
           <div className="w-[13%] p-2 flex items-center justify-center">Line Total</div>
        </div>

        {/* Rows */}
        <div className="flex flex-col divide-y-[2px] divide-black relative z-10 bg-white border-b-[2px] border-black">
            {/* Background Watermark Placeholder */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 overflow-hidden z-0">
                <span className="text-[120px] md:text-[200px] font-bold text-slate-400 select-none tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>Page 1</span>
            </div>
            
            {items.map((item, idx) => (
               <div key={idx} className="flex flex-col md:flex-row md:divide-x-[2px] divide-black hover:bg-slate-50 transition-colors z-10 relative bg-white/60 backdrop-blur-[1px]">
                  <div className="md:w-[8%] flex flex-col md:block p-2 md:p-0">
                     <span className="md:hidden text-[10px] font-bold bg-[#B7DEE8] p-1.5 mb-1 border-b border-black">Qty</span>
                     <input name={`item_qty_${idx}`} type="number" className="w-full h-full outline-none bg-transparent text-center md:px-2 min-h-[40px] md:min-h-[35px] font-semibold" />
                  </div>
                  <div className="md:w-[12%] flex flex-col md:block p-2 md:p-0 border-t border-slate-200 md:border-t-0">
                     <span className="md:hidden text-[10px] font-bold bg-[#B7DEE8] p-1.5 mb-1 border-b border-black">Item #</span>
                     <input name={`item_number_${idx}`} type="text" className="w-full h-full outline-none bg-transparent text-center md:px-2 min-h-[40px] md:min-h-[35px] font-semibold" />
                  </div>
                  <div className="md:w-[45%] flex flex-col md:block p-2 md:p-0 border-t border-slate-200 md:border-t-0">
                     <span className="md:hidden text-[10px] font-bold bg-[#B7DEE8] p-1.5 mb-1 border-b border-black">Description</span>
                     <input name={`item_desc_${idx}`} type="text" className="w-full h-full outline-none bg-transparent md:px-2 min-h-[40px] md:min-h-[35px] font-semibold" />
                  </div>
                  <div className="md:w-[10%] flex flex-col md:block p-2 md:p-0 border-t border-slate-200 md:border-t-0">
                     <span className="md:hidden text-[10px] font-bold bg-[#B7DEE8] p-1.5 mb-1 border-b border-black">Unit</span>
                     <input name={`item_unit_${idx}`} type="text" className="w-full h-full outline-none bg-transparent text-center md:px-2 min-h-[40px] md:min-h-[35px] font-semibold" />
                  </div>
                  <div className="md:w-[12%] flex flex-col md:block p-2 md:p-0 border-t border-slate-200 md:border-t-0">
                     <span className="md:hidden text-[10px] font-bold bg-[#B7DEE8] p-1.5 mb-1 border-b border-black">Unit Price</span>
                     <input name={`item_unitPrice_${idx}`} type="number" className="w-full h-full outline-none bg-transparent text-right md:text-center md:px-2 min-h-[40px] md:min-h-[35px] font-semibold" />
                  </div>
                  <div className="md:w-[13%] flex flex-col md:block p-2 md:p-0 border-t border-slate-200 md:border-t-0 bg-[#DAEEF3] md:bg-[#DAEEF3]/60">
                     <span className="md:hidden text-[10px] font-bold bg-[#B7DEE8] p-1.5 mb-1 border-b border-black">Line Total</span>
                     <input name={`item_lineTotal_${idx}`} type="number" className="w-full h-full outline-none bg-transparent text-right md:text-center md:px-2 min-h-[40px] md:min-h-[35px] font-semibold" />
                  </div>
               </div>
            ))}
        </div>

        {/* Total Row */}
        <div className="flex flex-col md:flex-row border-t-0 md:border-t-2 border-black bg-[#A5A5A5] divide-y-[2px] md:divide-y-0 md:divide-x-[2px] divide-black z-20 relative">
           <div className="w-full md:w-[87%] p-2 text-center text-sm font-extrabold flex items-center justify-center h-[40px]">
              Total
           </div>
           <div className="w-full md:w-[13%] p-0 h-[40px]">
              <input name="grandTotal" type="number" placeholder="0.00" className="w-full h-full bg-transparent outline-none text-center text-sm font-extrabold placeholder-black/30" />
           </div>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col p-6 md:p-8 bg-white gap-8 border-t-[2px] border-black">
           <div className="flex flex-col md:flex-row justify-between gap-12 mt-4 md:mt-8">
               <div className="flex-1 flex gap-6">
                  <div className="flex-1 border-b-[2px] border-slate-400 pb-1.5 flex flex-col justify-end">
                     <input name="acceptedBy" type="text" className="w-full outline-none text-[13px] font-medium text-slate-800 text-center bg-transparent" placeholder="Name/Signature" />
                     <p className="text-[11px] font-medium text-slate-500 text-center mt-1">Accepted By (Vendor)</p>
                  </div>
                  <div className="flex-1 border-b-[2px] border-slate-400 pb-1.5 flex flex-col justify-end">
                     <input name="acceptedDate" type="date" className="w-full outline-none text-[13px] font-medium text-slate-800 text-center bg-transparent" />
                     <p className="text-[11px] font-medium text-slate-500 text-center italic mt-1">Date</p>
                  </div>
               </div>
               <div className="flex-1 flex gap-6">
                  <div className="flex-[1.5] border-b-[2px] border-slate-400 pb-1.5 flex flex-col justify-end">
                     <input name="authorizedBy" type="text" className="w-full outline-none text-[13px] font-medium text-slate-800 text-center bg-transparent" placeholder="Name/Signature" />
                     <p className="text-[11px] font-medium text-slate-500 text-center mt-1">Authorized by</p>
                  </div>
                  <div className="flex-1 border-b-[2px] border-slate-400 pb-1.5 flex flex-col justify-end">
                     <input name="authorizedDate" type="date" className="w-full outline-none text-[13px] font-medium text-slate-800 text-center bg-transparent" />
                     <p className="text-[11px] font-medium text-slate-500 text-center italic mt-1">Date</p>
                  </div>
               </div>
            </div>

           <div className="text-[13px] font-medium text-slate-800 leading-tight space-y-1.5 mt-4">
              <p>1. Final Payment Will be made on Actual measurements</p>
              <p>2. Weekly payment will be made on basis of</p>
              <p>3. 10% Payment will be hold for 15 days after completion of work.</p>
              <p>4. Restricted access for Labor under age of 18 and without origional</p>
              <p>5. Contractor obligation to comply all terms of Unicorn SOP.</p>
           </div>
        </div>

      </div>
      
      {/* Submit */}
      <div className="mt-8 flex justify-center md:justify-end px-4 md:px-0 gap-4 print:hidden">
         <button type="button" onClick={() => window.print()} className="px-10 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold tracking-wide uppercase text-sm rounded-lg transition-all w-full md:w-auto">
            Print
         </button>
         <button disabled={isSubmitting} type="submit" className="px-10 py-3.5 bg-[#0B1121] hover:bg-[#0052FF] text-white font-extrabold tracking-wide uppercase text-sm rounded-lg transition-all shadow-xl shadow-blue-500/10 w-full md:w-auto disabled:opacity-70">
            {isSubmitting ? 'Submitting...' : 'Submit Work Order'}
         </button>
      </div>
    </form>
  );
}
