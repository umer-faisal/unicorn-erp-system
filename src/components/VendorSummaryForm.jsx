"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';

export default function VendorSummaryForm({ onSuccess }) {
  const [items, setItems] = useState(Array.from({ length: 5 }, (_, i) => ({ id: i })));
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData(e.target);
      const payload = Object.fromEntries(data.entries());
      payload.formId = 'vendorsummary';
      payload.submittedAt = new Date().toISOString();
      payload.submittedBy = user?.email || 'Unknown';
      
      await addDoc(collection(db, 'submissions'), payload);
      toast.success('Supplier Payment Summary submitted successfully!');
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
      {/* Title Row - Centered */}
      <div className="flex flex-row h-[50px] w-full items-center justify-center mb-2">
         <h2 className="font-extrabold text-[18px] md:text-[20px] tracking-wide uppercase" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
            SUMMARY - SUPPLIER PAYMENTS
         </h2>
      </div>

      {/* Wrapping the table in a horizontal scroll container */}
      <div className="w-full overflow-x-auto pb-4">
         <div className="min-w-[700px] border-x-[2px] border-t-[2px] border-black flex flex-col bg-white" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
            
            {/* Grid Header */}
            <div className="flex flex-row border-b-[2px] border-black text-[14px] font-bold">
               <div className="w-[15%] flex items-center justify-center border-r-[2px] border-black p-2.5">Date</div>
               <div className="w-[45%] flex items-center justify-center border-r-[2px] border-black p-2.5">Vendor</div>
               <div className="w-[20%] flex items-center justify-center border-r-[2px] border-black p-2.5 text-center leading-tight">Already Paid</div>
               <div className="w-[20%] flex items-center justify-center p-2.5 text-center leading-tight">Current Payment</div>
            </div>

            {/* Grid Rows */}
            <div className="flex flex-col border-b-[2px] border-black">
               {items.map((item, idx) => (
                  <div key={idx} className="flex flex-row border-b-[1px] border-black last:border-b-0 h-[32px] hover:bg-slate-100 transition-colors">
                     <div className="w-[15%] border-r-[1px] border-black p-0">
                        <input name={`item_date_${idx}`} type="date" className="w-full h-full outline-none bg-transparent px-2 text-[14px] text-center" />
                     </div>
                     <div className="w-[45%] border-r-[1px] border-black p-0">
                        <input name={`item_vendor_${idx}`} type="text" className="w-full h-full outline-none bg-transparent px-2 text-[14px]" />
                     </div>
                     <div className="w-[20%] border-r-[1px] border-black p-0">
                        <input name={`item_alreadyPaid_${idx}`} type="number" className="w-full h-full outline-none bg-transparent px-2 text-[14px] text-center" />
                     </div>
                     <div className="w-[20%] p-0">
                        <input name={`item_currentPayment_${idx}`} type="number" className="w-full h-full outline-none bg-transparent px-2 text-[14px] text-center" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
      
      {/* Submit Button */}
      <div className="mt-4 flex justify-end px-4 md:px-0 gap-4 print:hidden">
         <button type="button" onClick={() => window.print()} className="px-8 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold tracking-wide uppercase text-sm rounded transition-all">
            Print
         </button>
         <button disabled={isSubmitting} type="submit" className="px-8 py-2.5 bg-[#0B1121] hover:bg-[#0052FF] text-white font-bold tracking-wide uppercase text-sm rounded transition-all disabled:opacity-70">
            {isSubmitting ? 'Submitting...' : 'Submit Payment Summary'}
         </button>
      </div>
    </form>
  );
}
