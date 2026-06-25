"use client";

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';

export default function SiteProgressReportForm({ onSuccess }) {
  const [items, setItems] = useState(Array.from({ length: 10 }, (_, i) => ({ id: i })));
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData(e.target);
      const payload = Object.fromEntries(data.entries());
      payload.formId = 'siteprogress';
      payload.submittedAt = new Date().toISOString();
      payload.submittedBy = user?.email || 'Unknown';
      
      await addDoc(collection(db, 'submissions'), payload);
      toast.success('Site Progress Report submitted successfully!');
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
         <div className="min-w-[800px] border-[1px] border-black flex flex-col bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
            
            {/* Header Section */}
            <div className="flex flex-col">
               
               {/* Row 1: Logo & Daily Progress / Project */}
               <div className="flex flex-row h-[70px]">
                  {/* Col 1 + Col 2 (55%) */}
                  <div className="w-[55%] flex flex-row items-center p-2 relative">
                     <div className="w-[70px] h-[70px] flex items-center justify-center relative flex-shrink-0">
                        <img src="/logo.png" alt="Unicorn Logo" className="w-full h-full object-contain" />
                     </div>
                     <div className="ml-2 z-10 bg-white pr-2">
                        <h1 className="text-[20px] font-serif text-slate-800 italic tracking-tighter uppercase leading-none" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                           UNICORN INTERNATIONAL
                        </h1>
                     </div>
                     {/* Horizontal line extending from logo to the right */}
                     <div className="absolute top-[35px] left-[60px] right-0 border-b-[1px] border-black z-0"></div>
                  </div>
                  
                  {/* Col 3 + Col 4 (45%) */}
                  <div className="w-[45%] flex flex-col border-l-[1px] border-black relative bg-white z-10">
                     <div className="h-[35px] border-b-[1px] border-black flex items-center justify-center">
                        <h2 className="font-bold text-[18px] uppercase">Daily Progress Report</h2>
                     </div>
                     <div className="h-[35px] flex flex-row">
                        {/* Mapped to Col 3 (15% out of 45% total = 33.33%) */}
                        <div className="w-[33.33%] border-r-[1px] border-black flex items-center justify-center font-bold text-[15px] uppercase">
                           Project
                        </div>
                        {/* Mapped to Col 4 (30% out of 45% total = 66.67%) */}
                        <div className="w-[66.67%]">
                           <input name="project" required type="text" className="w-full h-full outline-none px-2 font-semibold" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Row 2: Report # & Date */}
               <div className="flex flex-row h-[35px] border-y-[1px] border-black">
                  {/* Col 1 (8%) */}
                  <div className="w-[8%] border-r-[1px] border-black"></div>
                  
                  {/* Col 2 (47%) */}
                  <div className="w-[47%] border-r-[1px] border-black flex items-center justify-end pr-2 font-bold text-[13px] uppercase">
                     Report #
                  </div>
                  
                  {/* Col 3 (15%) */}
                  <div className="w-[15%] border-r-[1px] border-black">
                     <input name="reportNumber" required type="text" className="w-full h-full outline-none px-2 text-center font-semibold" />
                  </div>
                  
                  {/* Col 4 (30%) split into Date Label and Input */}
                  <div className="w-[30%] flex flex-row">
                     <div className="w-[30%] border-r-[1px] border-black flex items-center px-2 font-bold text-[13px] uppercase">
                        Date
                     </div>
                     <div className="w-[70%]">
                        <input name="reportDate" required type="date" className="w-full h-full outline-none px-2 uppercase text-[12px] font-semibold" />
                     </div>
                  </div>
               </div>

            </div>

            {/* Grid Header */}
            <div className="flex flex-row border-b-[2px] border-black text-[13px] font-bold h-[35px]">
               <div className="w-[8%] flex items-center justify-center border-r-[1px] border-black p-1 text-center uppercase">
                  S.NO
               </div>
               <div className="w-[47%] flex items-center justify-center border-r-[1px] border-black p-1 text-center uppercase">
                  Description of Work
               </div>
               <div className="w-[15%] flex items-center justify-center border-r-[1px] border-black p-1 text-center uppercase">
                  Area
               </div>
               <div className="w-[30%] flex items-center justify-center p-1 text-center uppercase">
                  Remarks
               </div>
            </div>

            {/* Grid Rows */}
            <div className="flex flex-col">
               {items.map((item, idx) => (
                  <div key={idx} className="flex flex-row border-b-[1px] border-black last:border-b-0 h-[30px] hover:bg-slate-100 transition-colors">
                     <div className="w-[8%] border-r-[1px] border-black p-0 flex items-center justify-center font-semibold text-[13px]">
                        {idx + 1}
                     </div>
                     <div className="w-[47%] border-r-[1px] border-black p-0">
                        <input name={`item_desc_${idx}`} type="text" className="w-full h-full outline-none bg-transparent px-2 text-[13px]" />
                     </div>
                     <div className="w-[15%] border-r-[1px] border-black p-0">
                        <input name={`item_area_${idx}`} type="text" className="w-full h-full outline-none bg-transparent px-2 text-[13px] text-center" />
                     </div>
                     <div className="w-[30%] p-0">
                        <input name={`item_remarks_${idx}`} type="text" className="w-full h-full outline-none bg-transparent px-2 text-[13px]" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
      
      {/* Submit */}
      <div className="mt-2 flex justify-end px-4 md:px-0 gap-4 print:hidden">
         <button type="button" onClick={() => window.print()} className="px-8 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold tracking-wide uppercase text-sm rounded transition-all">
            Print
         </button>
         <button disabled={isSubmitting} type="submit" className="px-8 py-2.5 bg-[#0B1121] hover:bg-[#0052FF] text-white font-bold tracking-wide uppercase text-sm rounded transition-all disabled:opacity-70">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
         </button>
      </div>
    </form>
  );
}
