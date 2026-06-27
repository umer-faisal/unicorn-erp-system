import React, { useEffect, useRef } from 'react';
import { X, Printer, FileSpreadsheet } from 'lucide-react';
import VendorRegistrationForm from '@/components/VendorRegistrationForm';
import VendorQuotationForm from '@/components/VendorQuotationForm';
import ManpowerDeploymentForm from '@/components/ManpowerDeploymentForm';
import MeasurementForm from '@/components/MeasurementForm';
import SiteMeasurementForm from '@/components/SiteMeasurementForm';
import VendorSummaryForm from '@/components/VendorSummaryForm';
import PurchaseRequisitionForm from '@/components/PurchaseRequisitionForm';
import GoodReceivedNoteForm from '@/components/GoodReceivedNoteForm';
import SiteProgressReportForm from '@/components/SiteProgressReportForm';

const FORM_COMPONENTS = {
  'vendor': VendorRegistrationForm,
  'quotation': VendorQuotationForm,
  'manpower': ManpowerDeploymentForm,
  'measurement': MeasurementForm,
  'sitemeasurement': SiteMeasurementForm,
  'vendorsummary': VendorSummaryForm,
  'requisition': PurchaseRequisitionForm,
  'grn': GoodReceivedNoteForm,
  'progressreport': SiteProgressReportForm
};

export default function FormViewerModal({ record, onClose }) {
  const formRef = useRef(null);

  const handleExportCSV = () => {
    if (!record) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Field,Value\r\n";
    Object.entries(record).forEach(([key, value]) => {
       const val = String(value || '').replace(/"/g, '""');
       csvContent += `"${key}","${val}"\r\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `record_${record.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (formRef.current && record) {
      // Loop through record keys and inject values into the form
      Object.keys(record).forEach(key => {
        // Find input, select, or textarea with the exact name
        const input = formRef.current.querySelector(`[name="${key}"]`);
        if (input) {
          if (input.type === 'checkbox' || input.type === 'radio') {
            if (input.value === record[key]) {
              input.checked = true;
            }
          } else {
            input.value = record[key];
          }
        }
      });

      // Disable all inputs to make it read-only
      const allInputs = formRef.current.querySelectorAll('input, select, textarea, button');
      allInputs.forEach(el => {
        if (el.tagName.toLowerCase() !== 'button' || el.type === 'submit' || el.type === 'button') {
           el.style.pointerEvents = 'none';
        }
      });
    }
  }, [record]);

  if (!record) return null;

  const FormComponent = FORM_COMPONENTS[record.formId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm print:static print:bg-transparent print:p-0 print:m-0 print:block print:w-full print:h-auto print:overflow-visible">
      <div className="relative bg-[#f8f9fa] w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 print:static print:shadow-none print:border-none print:bg-transparent print:max-h-none print:max-w-none print:w-full print:rounded-none print:block print:h-auto print:overflow-visible">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 rounded-t-2xl shrink-0 print:hidden">
          <div>
             <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-widest">Submission Viewer</h2>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Record ID: <span className="text-[#0052FF]">{record.id}</span></p>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => window.print()}
               className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-[12px] font-extrabold transition-all shadow-sm uppercase tracking-wider"
             >
               <Printer className="w-4 h-4" /> Print / PDF
             </button>
             <button 
               onClick={handleExportCSV}
               className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-[12px] font-extrabold transition-all shadow-sm uppercase tracking-wider"
             >
               <FileSpreadsheet className="w-4 h-4" /> Export Excel
             </button>
             <div className="w-px h-6 bg-slate-200 mx-2"></div>
             <button 
               onClick={onClose}
               className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
             >
               <X className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0 print:block print:h-auto" ref={formRef}>
           <style>{`
             .modal-form-wrapper button[type="submit"],
             .modal-form-wrapper button.print-hidden,
             .modal-form-wrapper button {
                display: none !important;
             }
             .modal-form-wrapper input,
             .modal-form-wrapper textarea,
             .modal-form-wrapper select {
                background-color: transparent !important;
             }
             @media print {
                @page {
                   size: landscape;
                }
                body * {
                   -webkit-print-color-adjust: exact;
                   print-color-adjust: exact;
                }
                .modal-form-wrapper input,
                .modal-form-wrapper textarea,
                .modal-form-wrapper select {
                   background-color: transparent !important;
                }
                .modal-form-wrapper button {
                   display: none !important;
                }
                .modal-form-wrapper {
                   page-break-inside: avoid;
                   break-inside: avoid;
                }
                .modal-form-wrapper * {
                   page-break-inside: avoid;
                   break-inside: avoid;
                }
             }
           `}</style>
           <div className="modal-form-wrapper bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden print:shadow-none print:ring-0 print:rounded-none print:block print:absolute print:top-0 print:left-0 print:w-full print:p-6 print:overflow-visible print:bg-transparent">
              {FormComponent ? <FormComponent /> : <div className="p-8 text-center text-slate-500">Unknown Form Type</div>}
           </div>
        </div>

      </div>
    </div>
  );
}
