import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm">
      <div className="relative bg-[#f8f9fa] w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 rounded-t-2xl shrink-0">
          <div>
             <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-widest">Submission Viewer</h2>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Record ID: <span className="text-[#0052FF]">{record.id}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto p-6" ref={formRef}>
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
           `}</style>
           <div className="modal-form-wrapper bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden">
              {FormComponent ? <FormComponent /> : <div className="p-8 text-center text-slate-500">Unknown Form Type</div>}
           </div>
        </div>

      </div>
    </div>
  );
}
