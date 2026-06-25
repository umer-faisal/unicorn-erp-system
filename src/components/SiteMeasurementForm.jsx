"use client";

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';

export default function SiteMeasurementForm({ onSuccess }) {
  const [items, setItems] = useState(Array.from({ length: 10 }, (_, i) => ({ id: i })));
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData(e.target);
      const payload = Object.fromEntries(data.entries());
      payload.formId = 'sitemeasurement';
      payload.submittedAt = new Date().toISOString();
      payload.submittedBy = user?.email || 'Unknown';
      
      await addDoc(collection(db, 'submissions'), payload);
      toast.success('Site Measurement submitted successfully!');
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
      
      {/* Header - No Borders, exactly like screenshot */}
      <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-[70px] h-[70px] flex items-center justify-center relative flex-shrink-0">
               <img src="/logo.png" alt="Unicorn Logo" className="w-full h-full object-contain" />
            </div>
         <div className="ml-2">
            <h1 className="text-[28px] font-serif text-slate-800 italic tracking-tighter uppercase leading-none" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
               UNICORN INTERNATIONAL
            </h1>
         </div>
      </div>

      {/* Wrapping the table in a horizontal scroll container to preserve strict Excel-like columns on all devices */}
      <div className="w-full overflow-x-auto pb-4">
         <div className="min-w-[800px] border-[1px] border-black flex flex-col bg-white" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
            
            {/* Row 1: PROJECT */}
            <div className="flex flex-row border-b-[1px] border-black h-[30px]">
               <div className="w-[15%] flex items-center border-r-[1px] border-black font-bold text-[14px] px-2 py-1 uppercase">
                  PROJECT:
               </div>
               <div className="w-[85%] p-0">
                  <input name="project" required type="text" className="w-full h-full outline-none bg-transparent px-2 font-bold text-[14px]" />
               </div>
            </div>

            {/* Row 2: Title */}
            <div className="flex flex-row border-b-[1px] border-black h-[30px]">
               <div className="w-full flex items-center justify-center font-bold text-[15px] px-2 py-1 uppercase">
                  SITE MEASUREMENT SHEET - CEILING
               </div>
            </div>

            {/* Row 3: VENDOR */}
            <div className="flex flex-row border-b-[1px] border-black h-[30px]">
               <div className="w-[15%] flex items-center border-r-[1px] border-black font-bold text-[14px] px-2 py-1 uppercase">
                  VENDOR
               </div>
               <div className="w-[85%] p-0">
                  <input name="vendor" required type="text" className="w-full h-full outline-none bg-transparent px-2 font-bold text-[14px]" />
               </div>
            </div>

            {/* Grid Header */}
            <div className="flex flex-row border-b-[1px] border-black text-[13px]">
               <div className="w-[15%] flex flex-col items-center justify-center border-r-[1px] border-black p-1">
                  <span>Location /</span>
                  <span>Job ID</span>
               </div>
               <div className="w-[20%] flex flex-col border-r-[1px] border-black">
                  <div className="flex-1 flex items-center justify-center border-b-[1px] border-black p-1">Dimensions</div>
                  <div className="flex-1 flex flex-row min-h-[25px]">
                     <div className="w-1/2 flex items-center justify-center border-r-[1px] border-black p-1">Length (ft)</div>
                     <div className="w-1/2 flex items-center justify-center p-1">Width (FT)</div>
                  </div>
               </div>
               <div className="w-[20%] flex items-center justify-center border-r-[1px] border-black p-1">
                  Total Area
               </div>
               <div className="w-[45%] flex items-center justify-center p-1">
                  Remarks
               </div>
            </div>

            {/* Grid Rows */}
            <div className="flex flex-col">
               {items.map((item, idx) => (
                  <div key={idx} className="flex flex-row border-b-[1px] border-black last:border-b-0 h-[26px] hover:bg-slate-100 transition-colors">
                     <div className="w-[15%] border-r-[1px] border-black p-0">
                        <input name={`item_location_${idx}`} type="text" className="w-full h-full outline-none bg-transparent px-2 text-[13px] text-center" />
                     </div>
                     <div className="w-[20%] flex flex-row border-r-[1px] border-black">
                        <div className="w-1/2 border-r-[1px] border-black p-0">
                           <input name={`item_length_${idx}`} type="number" className="w-full h-full outline-none bg-transparent px-1 text-[13px] text-center" />
                        </div>
                        <div className="w-1/2 p-0">
                           <input name={`item_width_${idx}`} type="number" className="w-full h-full outline-none bg-transparent px-1 text-[13px] text-center" />
                        </div>
                     </div>
                     <div className="w-[20%] border-r-[1px] border-black p-0">
                        <input name={`item_totalArea_${idx}`} type="number" className="w-full h-full outline-none bg-transparent px-2 text-[13px] text-center" />
                     </div>
                     <div className="w-[45%] p-0">
                        <input name={`item_remarks_${idx}`} type="text" className="w-full h-full outline-none bg-transparent px-2 text-[13px]" />
                     </div>
                  </div>
               ))}
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
