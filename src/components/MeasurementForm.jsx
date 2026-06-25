"use client";

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';

export default function MeasurementForm({ onSuccess }) {
  const [items, setItems] = useState(Array.from({ length: 15 }, (_, i) => ({ id: i })));
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData(e.target);
      const payload = Object.fromEntries(data.entries());
      payload.formId = 'measurement';
      payload.submittedAt = new Date().toISOString();
      payload.submittedBy = user?.email || 'Unknown';
      
      await addDoc(collection(db, 'submissions'), payload);
      toast.success('Work Order submitted successfully!');
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
                 {/* The screenshot shows CS input has a slight green background/border */}
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
           <div className="w-full md:w-[13%] p-2 text-center text-sm font-extrabold flex items-center justify-center h-[40px]">
              -
           </div>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col p-6 md:p-8 bg-white gap-8 border-t-[2px] border-black">
           <div className="flex flex-col md:flex-row justify-between gap-12 mt-4 md:mt-8">
              <div className="flex-1 flex gap-6">
                 <div className="flex-1 border-t-[2px] border-slate-400 pt-1.5 text-center md:text-left">
                    <p className="text-[13px] font-medium text-slate-800">Accepted By</p>
                    <p className="text-[13px] font-medium text-slate-800">(Vendor)</p>
                 </div>
                 <div className="flex-1 border-t-[2px] border-slate-400 pt-1.5">
                    <p className="text-[13px] font-medium text-slate-800 text-center italic">Date</p>
                 </div>
              </div>
              <div className="flex-1 flex gap-6">
                 <div className="flex-[1.5] border-t-[2px] border-slate-400 pt-1.5 text-center md:text-left">
                    <p className="text-[13px] font-medium text-slate-800">Authorized by</p>
                 </div>
                 <div className="flex-1 border-t-[2px] border-slate-400 pt-1.5">
                    <p className="text-[13px] font-medium text-slate-800 text-center italic">Date</p>
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
