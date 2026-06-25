"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';

export default function VendorQuotationForm({ onSuccess }) {
  const [items, setItems] = useState(Array.from({ length: 10 }, (_, i) => ({ id: i })));
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData(e.target);
      const payload = Object.fromEntries(data.entries());
      payload.formId = 'quotation';
      payload.submittedAt = new Date().toISOString();
      payload.submittedBy = user?.email || 'Unknown';
      
      await addDoc(collection(db, 'submissions'), payload);
      toast.success('Vendor Quotation submitted successfully!');
      e.target.reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Error submitting form: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white text-black font-sans pb-10 overflow-hidden">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end p-4 md:p-8 gap-6 md:gap-12">
        <div className="w-full md:w-1/3 flex flex-col gap-4">
           <div className="flex items-end gap-3">
              <span className="text-sm font-semibold whitespace-nowrap">Ref #</span>
              <input name="refNumber" required type="text" className="flex-1 border-b border-black outline-none bg-transparent px-2 font-medium" />
           </div>
        </div>
        <div className="w-full md:w-auto text-center md:text-right">
           <h1 className="text-4xl md:text-5xl font-serif text-[#4A5568] italic tracking-tight" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              Vendor Quotation
           </h1>
        </div>
      </div>

      {/* Header Fields */}
      <div className="px-4 md:px-8 flex flex-col gap-6 mb-8 mt-2">
         <div className="flex items-end gap-4 w-full md:w-3/4">
            <span className="text-sm font-medium whitespace-nowrap w-16">Vendor</span>
            <input name="vendor" required type="text" className="flex-1 border-b border-black outline-none bg-transparent px-2 font-semibold" />
         </div>
         <div className="flex flex-col md:flex-row items-end gap-6 md:gap-12 w-full">
            <div className="flex items-end gap-4 flex-[2]">
               <span className="text-sm font-medium whitespace-nowrap w-16">Project</span>
               <input name="project" required type="text" className="flex-1 border-b border-black outline-none bg-transparent px-2 font-semibold" />
            </div>
            <div className="flex items-end gap-4 flex-1 w-full md:w-auto">
               <span className="text-sm font-medium whitespace-nowrap">DATE</span>
               <input name="date" required type="date" className="flex-1 border-b border-black outline-none bg-transparent px-2 uppercase text-sm font-semibold" />
            </div>
         </div>
         <div className="flex items-end gap-4 w-full md:w-3/4">
            <span className="text-sm font-medium whitespace-nowrap w-16">Trade</span>
            <input name="trade" required type="text" className="flex-1 border-b border-black outline-none bg-transparent px-2 font-semibold" />
         </div>
      </div>

      {/* Table 1: Terms */}
      <div className="border-t border-black border-b flex flex-col">
         <div className="hidden md:grid grid-cols-3 divide-x divide-black border-b border-black text-sm font-extrabold text-center">
            <div className="p-2.5">Area / Location</div>
            <div className="p-2.5">Payment Terms</div>
            <div className="p-2.5">Completion Time</div>
         </div>
         <div className="flex flex-col md:grid md:grid-cols-3 md:divide-x divide-black text-[13px] font-medium">
            <div className="p-2.5 min-h-[45px] flex flex-col md:block border-b md:border-b-0 border-black">
               <span className="md:hidden font-extrabold mb-1 bg-slate-100 p-1">Area / Location:</span>
               <input name="areaLocation" type="text" className="w-full h-full outline-none bg-transparent font-semibold" />
            </div>
            <div className="p-2.5 min-h-[45px] flex flex-col md:flex-row items-start md:items-center justify-center border-b md:border-b-0 border-black text-center md:text-center">
               <span className="md:hidden font-extrabold mb-1 w-full text-left bg-slate-100 p-1">Payment Terms:</span>
               <span className="w-full">Running Payment on progress, 10% Hold for final payment.</span>
               <input type="hidden" name="paymentTerms" value="Running Payment on progress, 10% Hold for final payment." />
            </div>
            <div className="p-2.5 min-h-[45px] flex flex-col md:block">
               <span className="md:hidden font-extrabold mb-1 bg-slate-100 p-1">Completion Time:</span>
               <input name="completionTime" type="text" className="w-full h-full outline-none bg-transparent font-semibold text-center" />
            </div>
         </div>
      </div>

      {/* Table 2: Items Grid */}
      <div className="border-b border-black relative border-x md:border-x-0">
         {/* Background Watermark Placeholder */}
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 overflow-hidden z-0">
            <span className="text-[120px] md:text-[200px] font-bold text-slate-400 select-none tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>Page 1</span>
         </div>

         {/* Desktop Header */}
         <div className="hidden md:flex border-b border-black text-[13px] font-extrabold text-center bg-white/90 relative z-10 divide-x divide-black">
            <div className="w-[12%] p-2.5">Room ID</div>
            <div className="w-[10%] p-2.5">QTY</div>
            <div className="w-[38%] p-2.5">Description</div>
            <div className="w-[10%] p-2.5">Unit</div>
            <div className="w-[15%] p-2.5">Unit Price</div>
            <div className="w-[15%] p-2.5">Total</div>
         </div>

         {/* Rows */}
         <div className="flex flex-col divide-y divide-black relative z-10 bg-white/60 backdrop-blur-[2px]">
            {items.map((item, idx) => (
               <div key={idx} className="flex flex-col md:flex-row md:divide-x divide-black group transition-colors">
                  <div className="md:w-[12%] flex flex-col md:block md:p-2.5 border-b md:border-b-0 border-black bg-white md:bg-transparent">
                     <span className="md:hidden text-[10px] uppercase tracking-widest font-extrabold bg-slate-200 p-2 border-b border-black block">Room ID</span>
                     <input name={`item_roomId_${idx}`} type="text" className="w-full outline-none bg-transparent text-center p-3 md:p-0 font-semibold h-full" />
                  </div>
                  <div className="md:w-[10%] flex flex-col md:block md:p-2.5 border-b md:border-b-0 border-black bg-white md:bg-transparent">
                     <span className="md:hidden text-[10px] uppercase tracking-widest font-extrabold bg-slate-200 p-2 border-b border-black block">QTY</span>
                     <input name={`item_qty_${idx}`} type="number" className="w-full outline-none bg-transparent text-center p-3 md:p-0 font-semibold h-full" />
                  </div>
                  <div className="md:w-[38%] flex flex-col md:block md:p-2.5 border-b md:border-b-0 border-black bg-white md:bg-transparent">
                     <span className="md:hidden text-[10px] uppercase tracking-widest font-extrabold bg-slate-200 p-2 border-b border-black block">Description</span>
                     <input name={`item_desc_${idx}`} type="text" className="w-full outline-none bg-transparent p-3 md:p-0 font-semibold h-full" />
                  </div>
                  <div className="md:w-[10%] flex flex-col md:block md:p-2.5 border-b md:border-b-0 border-black bg-white md:bg-transparent">
                     <span className="md:hidden text-[10px] uppercase tracking-widest font-extrabold bg-slate-200 p-2 border-b border-black block">Unit</span>
                     <input name={`item_unit_${idx}`} type="text" className="w-full outline-none bg-transparent text-center p-3 md:p-0 font-semibold h-full" />
                  </div>
                  <div className="md:w-[15%] flex flex-col md:block md:p-2.5 border-b md:border-b-0 border-black bg-white md:bg-transparent">
                     <span className="md:hidden text-[10px] uppercase tracking-widest font-extrabold bg-slate-200 p-2 border-b border-black block">Unit Price</span>
                     <input name={`item_unitPrice_${idx}`} type="number" className="w-full outline-none bg-transparent text-right md:text-center p-3 md:p-0 font-semibold h-full" />
                  </div>
                  <div className="md:w-[15%] flex flex-col md:block md:p-2.5 bg-white md:bg-transparent">
                     <span className="md:hidden text-[10px] uppercase tracking-widest font-extrabold bg-slate-200 p-2 border-b border-black block">Total</span>
                     <input name={`item_total_${idx}`} type="number" className="w-full outline-none bg-transparent text-right md:text-center p-3 md:p-0 font-semibold h-full" />
                  </div>
               </div>
            ))}
         </div>

         {/* Footer signature row inside the big box to match bottom layout */}
         <div className="flex flex-col md:grid md:grid-cols-3 md:divide-x divide-black text-[13px] text-center bg-white relative z-20 border-t border-black">
            <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 flex items-center justify-center">
               <img src="/logo.png" alt="Unicorn Logo" className="w-full h-full object-contain" />
            </div>
            <div className="p-3 border-b md:border-b-0 border-black min-h-[50px] flex items-center justify-center font-medium">Authorized by</div>
            <div className="p-3 min-h-[50px] flex items-center justify-center font-medium">Approved By</div>
         </div>
      </div>

      {/* Footer Action */}
      <div className="mt-8 flex justify-center md:justify-end px-4 md:px-0 gap-4 print:hidden">
         <button type="button" onClick={() => window.print()} className="px-10 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold tracking-wide uppercase text-sm rounded-lg transition-all w-full md:w-auto">
            Print
         </button>
         <button disabled={isSubmitting} type="submit" className="px-10 py-3.5 bg-[#0B1121] hover:bg-[#0052FF] text-white font-extrabold tracking-wide uppercase text-sm rounded-lg transition-all shadow-xl shadow-blue-500/10 w-full md:w-auto disabled:opacity-70">
            {isSubmitting ? 'Submitting...' : 'Submit Quotation'}
         </button>
      </div>

    </form>
  );
}
