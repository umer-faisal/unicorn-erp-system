"use client";

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';

export default function ManpowerDeploymentForm({ onSuccess }) {
  const [items, setItems] = useState(Array.from({ length: 15 }, (_, i) => ({ id: i })));
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData(e.target);
      const payload = Object.fromEntries(data.entries());
      payload.formId = 'manpower';
      payload.submittedAt = new Date().toISOString();
      payload.submittedBy = user?.email || 'Unknown';
      
      await addDoc(collection(db, 'submissions'), payload);
      toast.success('Manpower Deployment Report submitted successfully!');
      e.target.reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Error submitting form: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white text-black font-sans pb-4 print:h-auto print:overflow-visible print:block">
      
      {/* Outer Border Box */}
      <div className="border-[3px] border-black flex flex-col print:h-auto print:overflow-visible print:block">

         {/* Header Row */}
         <div className="flex flex-col md:flex-row border-b-[3px] border-black divide-y-[3px] md:divide-y-0 md:divide-x-[3px] divide-black">
            <div className="md:w-1/3 flex items-center justify-center p-3">
               <div className="w-16 h-16 flex items-center justify-center relative flex-shrink-0">
                  <img src="/logo.png" alt="Unicorn Logo" className="w-full h-full object-contain" />
               </div>
               <div className="ml-3">
                  <h1 className="text-[22px] md:text-[26px] font-serif text-slate-800 italic tracking-tight" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                     UNICORN INTERNATIONAL
                  </h1>
               </div>
            </div>
            <div className="md:w-2/3 flex items-center justify-center p-4 bg-white">
               <h2 className="text-xl md:text-[22px] font-extrabold tracking-wide text-center">Daily Manpower Deployment Report</h2>
            </div>
         </div>

         {/* Report # and Project Row */}
         <div className="flex flex-col md:flex-row border-b-[3px] border-black divide-y-[3px] md:divide-y-0 md:divide-x-[3px] divide-black font-bold text-[14px] text-center md:text-left bg-white">
            <div className="md:w-[15%] p-3 flex items-center justify-center">Report #</div>
            <div className="md:w-[35%] p-0">
               <input name="reportNumber" required type="text" className="w-full h-full p-3 outline-none bg-transparent min-h-[45px] text-center md:text-left font-semibold" />
            </div>
            <div className="md:w-[15%] p-3 flex items-center justify-center">Project</div>
            <div className="md:w-[35%] p-0">
               <input name="project" required type="text" className="w-full h-full p-3 outline-none bg-transparent min-h-[45px] text-center md:text-left font-semibold" />
            </div>
         </div>

         {/* Main Grid Header */}
         <div className="hidden md:flex flex-row border-b-[3px] border-black divide-x-[3px] divide-black text-[13px] font-extrabold text-center bg-white">
            <div className="w-[15%] flex items-center justify-center p-2.5">DATE</div>
            <div className="w-[25%] flex items-center justify-center p-2.5">TRADE</div>
            <div className="w-[30%] flex flex-col divide-y-[3px] divide-black">
               <div className="p-2 flex-1 flex items-center justify-center">ManPower</div>
               <div className="flex flex-row divide-x-[3px] divide-black h-1/2">
                  <div className="w-1/2 p-1.5 text-[12px] font-medium text-slate-700 flex items-center justify-center">Skilled</div>
                  <div className="w-1/2 p-1.5 text-[12px] font-medium text-slate-700 flex items-center justify-center">UnSkilled</div>
               </div>
            </div>
            <div className="w-[30%] flex items-center justify-center p-2.5">Remarks</div>
         </div>

         {/* Main Grid Rows */}
         <div className="flex flex-col divide-y-2 md:divide-y-[3px] divide-black bg-white print:h-auto print:overflow-visible print:block">
            {items.map((item, idx) => (
               <div key={idx} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }} className="flex flex-col md:flex-row md:divide-x-[3px] divide-black hover:bg-slate-50 transition-colors border-b-2 md:border-b-0 border-slate-300 md:border-transparent pb-3 md:pb-0">
                  <div className="md:w-[15%] flex flex-col md:block p-2 md:p-0 bg-slate-50 md:bg-transparent">
                     <span className="md:hidden text-[10px] uppercase font-bold text-slate-500 mb-1 border-b border-slate-200 pb-1">DATE</span>
                     <input name={`item_date_${idx}`} type="date" className="w-full h-full outline-none bg-transparent text-center md:px-2 min-h-[40px] text-sm font-semibold uppercase" />
                  </div>
                  <div className="md:w-[25%] flex flex-col md:block p-2 md:p-0">
                     <span className="md:hidden text-[10px] uppercase font-bold text-slate-500 mb-1 border-b border-slate-200 pb-1">TRADE</span>
                     <input name={`item_trade_${idx}`} type="text" className="w-full h-full outline-none bg-transparent md:px-2 min-h-[40px] text-sm font-semibold" />
                  </div>
                  
                  <div className="md:w-[30%] flex flex-row divide-x-[3px] divide-black border-y-2 md:border-y-0 border-slate-300 md:border-transparent bg-slate-50 md:bg-transparent">
                     <div className="w-1/2 flex flex-col md:block p-2 md:p-0">
                        <span className="md:hidden text-[10px] uppercase font-bold text-slate-700 mb-1 border-b border-slate-200 pb-1 text-center block">Skilled</span>
                        <input name={`item_skilled_${idx}`} type="number" className="w-full h-full outline-none bg-transparent text-center md:px-2 min-h-[40px] text-sm font-semibold" />
                     </div>
                     <div className="w-1/2 flex flex-col md:block p-2 md:p-0">
                        <span className="md:hidden text-[10px] uppercase font-bold text-slate-700 mb-1 border-b border-slate-200 pb-1 text-center block">UnSkilled</span>
                        <input name={`item_unskilled_${idx}`} type="number" className="w-full h-full outline-none bg-transparent text-center md:px-2 min-h-[40px] text-sm font-semibold" />
                     </div>
                  </div>

                  <div className="md:w-[30%] flex flex-col md:block p-2 md:p-0">
                     <span className="md:hidden text-[10px] uppercase font-bold text-slate-500 mb-1 border-b border-slate-200 pb-1">Remarks</span>
                     <input name={`item_remarks_${idx}`} type="text" className="w-full h-full outline-none bg-transparent md:px-2 min-h-[40px] text-sm font-semibold" />
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center md:justify-end px-4 md:px-0 gap-4 print:hidden">
         <button type="button" onClick={() => window.print()} className="px-10 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold tracking-wide uppercase text-sm rounded-lg transition-all w-full md:w-auto">
            Print
         </button>
         <button disabled={isSubmitting} type="submit" className="px-10 py-3.5 bg-[#0B1121] hover:bg-[#0052FF] text-white font-extrabold tracking-wide uppercase text-sm rounded-lg transition-all shadow-xl shadow-blue-500/10 w-full md:w-auto disabled:opacity-70">
            {isSubmitting ? 'Submitting...' : 'Submit Manpower Report'}
         </button>
      </div>

    </form>
  );
}
