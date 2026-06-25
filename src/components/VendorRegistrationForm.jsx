"use client";

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';

export default function VendorRegistrationForm({ onSuccess }) {
  const [projects, setProjects] = useState([
    { id: 1 },
    { id: 2 },
    { id: 3 },
  ]);

  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData(e.target);
      const payload = Object.fromEntries(data.entries());
      payload.formId = 'vendor';
      payload.submittedAt = new Date().toISOString();
      payload.submittedBy = user?.email || 'Unknown';
      
      await addDoc(collection(db, 'submissions'), payload);
      toast.success('Vendor Registration submitted successfully!');
      e.target.reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Error submitting form: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white text-black font-sans pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between p-4 md:p-6 border-b-[3px] border-black gap-4">
         <div className="flex flex-col md:flex-row items-center md:items-center gap-4 w-full">
            <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 flex items-center justify-center">
               <img src="/logo.png" alt="Unicorn Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-center md:text-left flex-1 mt-2 md:mt-0 pt-2">
               <h1 className="text-2xl sm:text-3xl md:text-[38px] font-serif tracking-widest text-slate-800 italic uppercase leading-none" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                  Unicorn International
               </h1>
            </div>
         </div>
      </div>

      <div className="bg-[#D9E2F3] text-center py-2.5 border-b-[3px] border-black font-extrabold tracking-widest text-[13px] md:text-sm uppercase">
         VENDOR REGISTRATION FORM
      </div>
      <div className="bg-[#F2F2F2] text-center py-2.5 border-b-[3px] border-black font-extrabold text-[13px] md:text-sm">
         Section 1: Company Details and General Information
      </div>

      {/* Grid Form */}
      <div className="flex flex-col border-b-[3px] border-black">
         
         {/* Row 1 */}
         <div className="flex flex-col md:flex-row border-b border-black">
            <div className="md:w-[300px] p-2.5 border-b md:border-b-0 md:border-r border-black font-semibold text-sm flex items-center shrink-0">
               1. Name of Company
            </div>
            <div className="flex-1 p-0">
               <input name="companyName" required type="text" className="w-full h-full p-2.5 outline-none bg-transparent min-h-[45px] text-sm font-semibold" />
            </div>
         </div>

         {/* Row 2 */}
         <div className="flex flex-col md:flex-row border-b border-black">
            <div className="md:w-[300px] p-2.5 border-b md:border-b-0 md:border-r border-black font-semibold text-sm flex items-center shrink-0">
               2. Address:
            </div>
            <div className="flex-1 p-0">
               <input name="address" required type="text" className="w-full h-full p-2.5 outline-none bg-transparent min-h-[45px] text-sm font-semibold" />
            </div>
         </div>

         {/* Row 3 */}
         <div className="flex flex-col md:flex-row border-b border-black">
            <div className="md:w-[300px] p-2.5 border-b md:border-b-0 md:border-r border-black font-semibold text-sm flex items-center shrink-0">
               3. Tel:
            </div>
            <div className="flex-1 p-0 border-b md:border-b-0 md:border-r border-black">
               <input name="tel" type="text" className="w-full h-full p-2.5 outline-none bg-transparent min-h-[45px] text-sm font-semibold" />
            </div>
            <div className="md:w-[150px] p-2.5 border-b md:border-b-0 md:border-r border-black font-semibold text-sm flex items-center justify-center shrink-0">
               4. WhatsApp
            </div>
            <div className="flex-1 p-0">
               <input name="whatsapp" type="text" className="w-full h-full p-2.5 outline-none bg-transparent min-h-[45px] text-sm font-semibold" />
            </div>
         </div>

         {/* Row 4: Type of Business */}
         <div className="flex flex-col border-b border-black">
            <div className="p-2.5 border-b border-black font-semibold text-sm">
               5. Type of Business (mark one only)
            </div>
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-black min-h-[45px]">
               <label className="flex-1 p-2.5 flex items-center justify-between md:justify-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-medium">Corporate Limited</span>
                  <input type="radio" value="Corporate Limited" name="businessType" className="w-4 h-4 cursor-pointer" />
               </label>
               <label className="flex-1 p-2.5 flex items-center justify-between md:justify-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-medium">Partnership:</span>
                  <input type="radio" value="Partnership" name="businessType" className="w-4 h-4 cursor-pointer" />
               </label>
               <div className="flex-[2] flex flex-col sm:flex-row items-stretch border-t md:border-t-0 border-black min-h-[45px]">
                  <div className="p-2.5 border-b sm:border-b-0 sm:border-r border-black sm:w-[150px] text-sm font-medium flex items-center shrink-0">Other (specify):</div>
                  <input name="otherBusinessType" type="text" className="flex-1 p-2.5 outline-none bg-transparent h-full text-sm font-semibold min-h-[40px]" />
               </div>
            </div>
         </div>

         {/* Row 5: Nature of Business */}
         <div className="flex flex-col border-b border-black">
            <div className="p-2.5 border-b border-black font-semibold text-sm">
               6. Nature of business:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-y sm:divide-y-0 md:divide-x divide-black">
               <div className="flex flex-col divide-y divide-black sm:border-r border-black">
                  <label className="p-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 min-h-[50px]">
                     <span className="text-sm font-medium">Manufacturer</span><input type="radio" value="Manufacturer" name="nature" className="w-4 h-4" />
                  </label>
                  <label className="p-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 min-h-[50px]">
                     <span className="text-sm font-medium">Trader</span><input type="radio" value="Trader" name="nature" className="w-4 h-4" />
                  </label>
               </div>
               <div className="flex flex-col divide-y divide-black md:border-r border-black border-t sm:border-t-0">
                  <label className="p-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 min-h-[50px]">
                     <span className="text-sm font-medium">Service Provider</span><input type="radio" value="Service Provider" name="nature" className="w-4 h-4" />
                  </label>
                  <label className="p-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 min-h-[50px]">
                     <span className="text-sm font-medium">Consulting Company</span><input type="radio" value="Consulting Company" name="nature" className="w-4 h-4" />
                  </label>
               </div>
               <div className="flex flex-col col-span-1 sm:col-span-2 md:col-span-1 border-t md:border-t-0 border-black">
                  <div className="p-2.5 text-sm font-medium border-b border-black">Others (specify):</div>
                  <textarea name="otherNature" className="flex-1 p-2.5 outline-none bg-transparent w-full resize-none min-h-[60px] text-sm font-semibold"></textarea>
               </div>
            </div>
         </div>

         {/* Row 6 */}
         <div className="flex flex-col md:flex-row border-b border-black">
            <div className="md:w-[300px] p-2.5 border-b md:border-b-0 md:border-r border-black font-semibold text-sm flex items-center shrink-0">
               7. Year established:
            </div>
            <div className="flex-[0.8] p-0 border-b md:border-b-0 md:border-r border-black">
               <input name="yearEstablished" type="text" className="w-full h-full p-2.5 outline-none bg-transparent min-h-[45px] text-sm font-semibold" />
            </div>
            <div className="md:w-[280px] p-2.5 border-b md:border-b-0 md:border-r border-black font-semibold text-sm flex items-center shrink-0">
               8. Number of Full-time Employees
            </div>
            <div className="flex-1 p-0">
               <input name="employees" type="number" className="w-full h-full p-2.5 outline-none bg-transparent min-h-[45px] text-sm font-semibold" />
            </div>
         </div>

         {/* Row 7 */}
         <div className="flex flex-col md:flex-row border-b border-black">
            <div className="md:w-[300px] p-2.5 border-b md:border-b-0 md:border-r border-black font-semibold text-sm flex items-center shrink-0">
               9. Tax I.D.
            </div>
            <div className="flex-1 p-0">
               <input name="taxId" type="text" className="w-full h-full p-2.5 outline-none bg-transparent min-h-[45px] text-sm font-semibold uppercase" />
            </div>
         </div>

         {/* Row 8 */}
         <div className="flex flex-col md:flex-row border-b border-black">
            <div className="md:w-[300px] p-2.5 border-b md:border-b-0 md:border-r border-black font-semibold text-sm flex items-center shrink-0">
               10. Contact Person
            </div>
            <div className="flex-1 p-0">
               <input name="contactPerson" type="text" className="w-full h-full p-2.5 outline-none bg-transparent min-h-[45px] text-sm font-semibold" />
            </div>
         </div>

         {/* Row 9 */}
         <div className="flex flex-col md:flex-row border-b border-black">
            <div className="md:w-[300px] p-2.5 border-b md:border-b-0 md:border-r border-black font-semibold text-sm flex items-center shrink-0">
               11. CNIC #
            </div>
            <div className="flex-[1.5] p-0 border-b md:border-b-0 md:border-r border-black">
               <input name="cnic" type="text" className="w-full h-full p-2.5 outline-none bg-transparent min-h-[45px] text-sm font-semibold tracking-widest" />
            </div>
            <div className="md:w-[120px] p-2.5 border-b md:border-b-0 md:border-r border-black font-semibold text-sm flex items-center justify-center shrink-0">
               Cell#
            </div>
            <div className="flex-1 p-0">
               <input name="cell" type="text" className="w-full h-full p-2.5 outline-none bg-transparent min-h-[45px] text-sm font-semibold" />
            </div>
         </div>

         {/* Row 10 */}
         <div className="flex flex-col md:flex-row border-b border-black">
            <div className="md:w-[300px] p-2.5 border-b md:border-b-0 md:border-r border-black font-semibold text-sm flex items-center shrink-0">
               12. Bank Account
            </div>
            <div className="flex-1 p-0">
               <input name="bankAccount" type="text" className="w-full h-full p-2.5 outline-none bg-transparent min-h-[45px] text-sm font-semibold font-mono" />
            </div>
         </div>

         {/* Row 11: Projects Table */}
         <div className="flex flex-col">
            <div className="p-2.5 border-b border-black font-semibold text-sm bg-white">
               22. Project Completed within 3 Years
            </div>
            
            {/* Desktop Table Header */}
            <div className="hidden md:flex flex-row border-b border-black bg-white font-semibold text-sm text-center">
               <div className="flex-[1.5] p-2.5 border-r border-black flex items-center justify-center">Name of company</div>
               <div className="flex-[2] p-2.5 border-r border-black flex items-center justify-center">Address</div>
               <div className="flex-1 p-2.5 border-r border-black flex items-center justify-center">Phone #</div>
               <div className="flex-1 p-2.5 flex items-center justify-center">Contract Value</div>
            </div>

            {/* Dynamic Table Rows */}
            {projects.map((proj) => (
               <div key={proj.id} className="flex flex-col md:flex-row border-b border-black last:border-b-0 bg-white group">
                  <div className="md:flex-[1.5] flex flex-col md:flex-row md:border-r border-black">
                     <span className="md:hidden text-xs font-bold px-3 py-1.5 bg-[#F2F2F2] border-b border-black uppercase tracking-wider">Name of company</span>
                     <input name={`project_name_${proj.id}`} type="text" className="w-full p-2.5 outline-none bg-transparent h-[45px] md:h-auto border-b md:border-b-0 border-black text-sm font-semibold text-center md:text-left" />
                  </div>
                  <div className="md:flex-[2] flex flex-col md:flex-row md:border-r border-black">
                     <span className="md:hidden text-xs font-bold px-3 py-1.5 bg-[#F2F2F2] border-b border-black uppercase tracking-wider">Address</span>
                     <input name={`project_address_${proj.id}`} type="text" className="w-full p-2.5 outline-none bg-transparent h-[45px] md:h-auto border-b md:border-b-0 border-black text-sm font-semibold text-center md:text-left" />
                  </div>
                  <div className="md:flex-1 flex flex-col md:flex-row md:border-r border-black">
                     <span className="md:hidden text-xs font-bold px-3 py-1.5 bg-[#F2F2F2] border-b border-black uppercase tracking-wider">Phone #</span>
                     <input name={`project_phone_${proj.id}`} type="text" className="w-full p-2.5 outline-none bg-transparent h-[45px] md:h-auto border-b md:border-b-0 border-black text-sm font-semibold text-center" />
                  </div>
                  <div className="md:flex-1 flex flex-col md:flex-row relative">
                     <span className="md:hidden text-xs font-bold px-3 py-1.5 bg-[#F2F2F2] border-b border-black uppercase tracking-wider">Contract Value</span>
                     <input name={`project_value_${proj.id}`} type="text" className="w-full p-2.5 outline-none bg-transparent h-[45px] md:h-auto text-sm font-semibold text-center md:text-right" />
                  </div>
               </div>
            ))}
         </div>

      </div>
      
      {/* Footer Action */}
      <div className="mt-8 flex justify-center md:justify-end px-4 md:px-0 gap-4 print:hidden">
         <button type="button" onClick={() => window.print()} className="px-10 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold tracking-wide uppercase text-sm rounded transition-all w-full md:w-auto">
            Print
         </button>
         <button disabled={isSubmitting} type="submit" className="px-10 py-3 bg-[#0B1121] hover:bg-[#0052FF] text-white font-extrabold tracking-wide uppercase text-sm rounded transition-all shadow-xl shadow-blue-500/10 w-full md:w-auto disabled:opacity-70">
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
         </button>
      </div>

    </form>
  );
}
