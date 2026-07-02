"use client";

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { createNotification } from '@/lib/notificationService';
import { sendNotificationEmail } from '@/lib/emailService';

export default function PurchaseRequisitionForm({ onSuccess }) {
  const [items, setItems] = useState(Array.from({ length: 15 }, (_, i) => ({ id: i })));
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData(e.target);
      const payload = Object.fromEntries(data.entries());
      payload.formId = 'requisition';
      payload.submittedAt = new Date().toISOString();
      payload.submittedBy = user?.email || 'Unknown';
      
      // Cascade fields
      payload.status = 'pending';
      payload.createdByEmail = user?.email || '';
      payload.assignedToRole = 'Accountant';
      
      const docRef = await addDoc(collection(db, 'submissions'), payload);
      
      // Create notification for Accountant role
      await createNotification({
        recipientRole: 'Accountant',
        message: `New Purchase Requisition (Req# ${payload.reqNumber || 'N/A'}) submitted by ${user?.name || user?.email}. Please create a Work Order.`,
        relatedDocId: docRef.id,
        relatedFormType: 'requisition',
      });

      // Also notify Admin
      await createNotification({
        recipientRole: 'Admin',
        message: `New Purchase Requisition (Req# ${payload.reqNumber || 'N/A'}) submitted by ${user?.name || user?.email}.`,
        relatedDocId: docRef.id,
        relatedFormType: 'requisition',
      });

      // Send email notification
      await sendNotificationEmail(
        '', // Accountant email — will be sent to template's default or can be dynamically fetched
        'New Purchase Requisition Submitted',
        `A new Purchase Requisition (Req# ${payload.reqNumber || 'N/A'}) has been submitted by ${user?.name || user?.email}. Please login to create a Work Order.`
      );

      toast.success('Purchase Requisition submitted successfully!');
      e.target.reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Error submitting form: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white text-black font-sans pb-4">
      {/* Wrapping the table in a horizontal scroll container */}
      <div className="w-full overflow-x-auto pb-4">
         <div className="min-w-[800px] flex flex-col bg-white" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
            
            {/* Top Header Section (No outer border) */}
            <div className="flex flex-row mb-2">
               {/* Logo Area */}
               <div className="w-[35%] flex flex-col justify-end p-2 pb-0">
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
               
               {/* Req # Area */}
               <div className="w-[20%] flex flex-col justify-end px-2">
                  <div className="border border-black border-b-0 text-center text-[13px] p-0.5 font-medium">Req. #</div>
                  <div className="border border-black h-[30px] p-0">
                     <input name="reqNumber" required type="text" className="w-full h-full outline-none text-center px-1 font-semibold" />
                  </div>
                  <div className="text-[12px] text-center bg-gray-200 mt-1">Office Use Only</div>
               </div>

               {/* Requisition Date Area */}
               <div className="w-[45%] flex flex-col justify-end pl-10 pr-4">
                  <div className="border border-black border-b-0 text-center text-[13px] p-0.5 font-medium">Requisition Date</div>
                  <div className="border border-black h-[30px] p-0">
                     <input name="reqDate" required type="date" className="w-full h-full outline-none text-center px-1 text-[13px] uppercase font-semibold" />
                  </div>
               </div>
            </div>

            {/* The Grid Table Box */}
            <div className="border-[2px] border-black flex flex-col">
               
               {/* Title Row */}
               <div className="flex flex-row border-b-[2px] border-black h-[35px] items-center justify-center">
                  <h2 className="font-bold text-[18px]">Purchase Requisition</h2>
               </div>

               {/* Supervisor & Project */}
               <div className="flex flex-col border-b-[2px] border-black">
                  <div className="flex flex-row border-b-[1px] border-black h-[30px]">
                     <div className="w-[20%] flex items-center justify-center border-r-[1px] border-black text-[14px]">
                        Supervisor
                     </div>
                     <div className="w-[80%] p-0">
                        <input name="supervisor" required type="text" className="w-full h-full outline-none px-2 font-semibold text-[14px]" />
                     </div>
                  </div>
                  <div className="flex flex-row h-[30px]">
                     <div className="w-[20%] flex items-center justify-center border-r-[1px] border-black text-[14px]">
                        Project
                     </div>
                     <div className="w-[80%] p-0">
                        <input name="project" required type="text" className="w-full h-full outline-none px-2 font-semibold text-[14px]" />
                     </div>
                  </div>
               </div>

               {/* Grid Header */}
               <div className="flex flex-row border-b-[2px] border-black text-[13px]">
                  <div className="w-[12%] flex flex-col items-center justify-center border-r-[1px] border-black p-1 text-center">
                     <span>Cost Center</span>
                     <span className="text-[11px]">(office use Only)</span>
                  </div>
                  <div className="w-[20%] flex items-center justify-center border-r-[1px] border-black p-1 text-center">
                     Category
                  </div>
                  <div className="w-[48%] flex items-center justify-center border-r-[1px] border-black p-1 text-center">
                     Item details
                  </div>
                  <div className="w-[10%] flex items-center justify-center border-r-[1px] border-black p-1 text-center">
                     Quantity
                  </div>
                  <div className="w-[10%] flex items-center justify-center p-1 text-center">
                     Unit
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
                        <div className="w-[48%] border-r-[1px] border-black p-0">
                           <input name={`item_details_${idx}`} type="text" className="w-full h-full outline-none bg-transparent px-2 text-[13px]" />
                        </div>
                        <div className="w-[10%] border-r-[1px] border-black p-0">
                           <input name={`item_qty_${idx}`} type="number" className="w-full h-full outline-none bg-transparent px-1 text-[13px] text-center" />
                        </div>
                        <div className="w-[10%] p-0">
                           <input name={`item_unit_${idx}`} type="text" className="w-full h-full outline-none bg-transparent px-1 text-[13px] text-center" />
                        </div>
                     </div>
                  ))}
               </div>

               {/* Footer */}
               <div className="flex flex-row h-[45px]">
                  <div className="w-[15%] flex items-center justify-center border-r-[1px] border-black text-[13px] font-medium">
                     Required By
                  </div>
                  <div className="w-[35%] border-r-[1px] border-black p-0">
                     <input name="requiredBy" type="text" className="w-full h-full outline-none px-2" />
                  </div>
                  <div className="w-[15%] flex items-center justify-center border-r-[1px] border-black text-[13px] font-medium">
                     Approved by
                  </div>
                  <div className="w-[35%] p-0">
                     <input name="approvedBy" type="text" className="w-full h-full outline-none px-2" />
                  </div>
               </div>
            </div>
         </div>
      </div>
      
      {/* Submit Button */}
      <div className="mt-2 flex justify-end px-4 md:px-0 gap-4 print:hidden">
         <button type="button" onClick={() => window.print()} className="px-8 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold tracking-wide uppercase text-sm rounded transition-all">
            Print
         </button>
         <button disabled={isSubmitting} type="submit" className="px-8 py-2.5 bg-[#0B1121] hover:bg-[#0052FF] text-white font-bold tracking-wide uppercase text-sm rounded transition-all disabled:opacity-70">
            {isSubmitting ? 'Submitting...' : 'Submit Requisition'}
         </button>
      </div>
    </form>
  );
}
