"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveUserTab } from '@/store/slices/userSlice';
import { LogOut, LayoutDashboard, FileText, Bell, ReceiptText, Users, ShoppingCart, Ruler, Wallet, FilePlus, PackageCheck, LineChart, Menu, X } from 'lucide-react';
import VendorRegistrationForm from '@/components/VendorRegistrationForm';
import VendorQuotationForm from '@/components/VendorQuotationForm';
import ManpowerDeploymentForm from '@/components/ManpowerDeploymentForm';
import MeasurementForm from '@/components/MeasurementForm';
import SiteMeasurementForm from '@/components/SiteMeasurementForm';
import VendorSummaryForm from '@/components/VendorSummaryForm';
import PurchaseRequisitionForm from '@/components/PurchaseRequisitionForm';
import GoodReceivedNoteForm from '@/components/GoodReceivedNoteForm';
import SiteProgressReportForm from '@/components/SiteProgressReportForm';

export default function UserDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.user.activeTab);
  
  const setActiveTab = (val) => dispatch(setActiveUserTab(val));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // If not logged in, or not a valid field operator/accountant role, push to root
    if (!loading && (!user || (user.role !== 'Site Supervisor' && user.role !== 'Accountant' && user.role !== 'User'))) {
       router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 w-full">
          <div className="w-8 h-8 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin mb-4"></div>
       </div>
     );
  }

  // Access Control Helper
  const hasAccess = (workflowId) => {
    // If permissions array exists, check it. Otherwise fallback to true for backward compatibility with old mock users.
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(workflowId);
    }
    return true; 
  };

  return (
    <div className="min-h-screen print:min-h-0 bg-slate-50 flex font-sans text-slate-900 w-full relative overflow-x-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* User Sidebar */}
      <aside className={`w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 z-40 shadow-2xl overflow-y-auto print:hidden transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-8 border-b border-slate-800/60 sticky top-0 bg-slate-900 z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo-svg.png" alt="Logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-white font-extrabold text-xl tracking-tight">Operator</h1>
            </div>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-6 pb-8">
          <p className="px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4">Workflows</p>
          
          {hasAccess('dashboard') && (
            <button 
               onClick={() => setActiveTab('dashboard')}
               className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-extrabold transition-all ${activeTab === 'dashboard' ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'}`}
            >
               <LayoutDashboard className="w-4 h-4" /> Dashboard Overview
            </button>
          )}

          {hasAccess('vendor') && (
            <button 
               onClick={() => setActiveTab('vendor')}
               className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-extrabold transition-all ${activeTab === 'vendor' ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'}`}
            >
               <FileText className="w-4 h-4" /> Vendor Registration
            </button>
          )}

          {hasAccess('quotation') && (
            <button 
               onClick={() => setActiveTab('quotation')}
               className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-extrabold transition-all ${activeTab === 'quotation' ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'}`}
            >
               <ReceiptText className="w-4 h-4" /> Vendor Quotation
            </button>
          )}

          {hasAccess('manpower') && (
            <button 
               onClick={() => setActiveTab('manpower')}
               className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-extrabold transition-all ${activeTab === 'manpower' ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'}`}
            >
               <Users className="w-4 h-4" /> Daily Manpower
            </button>
          )}

          {hasAccess('measurement') && (
            <button 
               onClick={() => setActiveTab('measurement')}
               className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-extrabold transition-all ${activeTab === 'measurement' ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'}`}
            >
               <ShoppingCart className="w-4 h-4" /> Work Order
            </button>
          )}

          {hasAccess('sitemeasurement') && (
            <button 
               onClick={() => setActiveTab('sitemeasurement')}
               className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-extrabold transition-all ${activeTab === 'sitemeasurement' ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'}`}
            >
               <Ruler className="w-4 h-4" /> Site Measurements
            </button>
          )}

          {hasAccess('vendorsummary') && (
            <button 
               onClick={() => setActiveTab('vendorsummary')}
               className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-extrabold transition-all ${activeTab === 'vendorsummary' ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'}`}
            >
               <Wallet className="w-4 h-4" /> Supplier Payments
            </button>
          )}

          {hasAccess('requisition') && (
            <button 
               onClick={() => setActiveTab('requisition')}
               className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-extrabold transition-all ${activeTab === 'requisition' ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'}`}
            >
               <FilePlus className="w-4 h-4" /> Purchase Requisition
            </button>
          )}

          {hasAccess('grn') && (
            <button 
               onClick={() => setActiveTab('grn')}
               className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-extrabold transition-all ${activeTab === 'grn' ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'}`}
            >
               <PackageCheck className="w-4 h-4" /> Good Received Note
            </button>
          )}

          {hasAccess('progressreport') && (
            <button 
               onClick={() => setActiveTab('progressreport')}
               className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-extrabold transition-all ${activeTab === 'progressreport' ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'}`}
            >
               <LineChart className="w-4 h-4" /> Site Progress
            </button>
          )}
        </nav>

        {/* User Actions */}
        <div className="p-4 m-5 bg-slate-800/40 rounded-2xl border border-slate-700/50 flex flex-col gap-4 mt-auto">
          <div className="flex items-center gap-3 px-1">
             <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-extrabold text-sm shadow-inner shrink-0 overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || 'User'}`} alt="Avatar" className="w-full h-full object-cover" />
             </div>
             <div className="overflow-hidden">
               <p className="text-white text-[13px] font-bold leading-tight truncate">{user.name}</p>
               <p className="text-slate-400 text-[11px] font-medium truncate mt-0.5">{user.email}</p>
             </div>
          </div>
          <div className="pt-4 border-t border-slate-700/60">
             <button onClick={logout} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-[11px] font-bold transition-all uppercase tracking-wider">
                <LogOut className="w-3.5 h-3.5" /> Logout
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full md:ml-64 print:ml-0 flex flex-col min-h-screen print:min-h-0">
        {/* Top Navbar */}
        <header className="h-[80px] bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-500 hover:text-slate-900" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-[13px] font-bold text-slate-500 hidden md:flex items-center gap-3 tracking-wide">
              Current Session: <span className="text-blue-700 font-extrabold bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg shadow-sm">{user.role}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-emerald-600 transition-colors p-2 hover:bg-emerald-50 rounded-full">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || 'User'}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Inner Content */}
        <div className="p-10 print:p-0 max-w-[1400px] mx-auto w-full">
           
           {activeTab === 'dashboard' && hasAccess('dashboard') && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 print:hidden">
                   <div>
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Operator Dashboard</h2>
                     <p className="text-slate-500 text-[14px] font-medium">Welcome back. Select a workflow from the sidebar to begin data entry.</p>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                    {hasAccess('vendor') && (
                      <div onClick={() => {setActiveTab('vendor'); setIsSidebarOpen(false);}} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col">
                         <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#0052FF] group-hover:text-white transition-colors shrink-0">
                            <FileText className="w-5 h-5" />
                         </div>
                         <h3 className="text-sm font-bold text-slate-900 mb-1">Vendor Reg</h3>
                         <p className="text-[11px] font-medium text-slate-500 line-clamp-2">Complete the physical equivalent form digitally to register a new vendor.</p>
                      </div>
                    )}

                    {hasAccess('quotation') && (
                      <div onClick={() => {setActiveTab('quotation'); setIsSidebarOpen(false);}} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col">
                         <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#0052FF] group-hover:text-white transition-colors shrink-0">
                            <ReceiptText className="w-5 h-5" />
                         </div>
                         <h3 className="text-sm font-bold text-slate-900 mb-1">Vendor Quotation</h3>
                         <p className="text-[11px] font-medium text-slate-500 line-clamp-2">Enter comprehensive quotation details including materials, quantities, and pricing.</p>
                      </div>
                    )}

                    {hasAccess('manpower') && (
                      <div onClick={() => {setActiveTab('manpower'); setIsSidebarOpen(false);}} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col">
                         <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#0052FF] group-hover:text-white transition-colors shrink-0">
                            <Users className="w-5 h-5" />
                         </div>
                         <h3 className="text-sm font-bold text-slate-900 mb-1">Daily Manpower</h3>
                         <p className="text-[11px] font-medium text-slate-500 line-clamp-2">Submit the daily manpower deployment report categorizing skilled and unskilled labor.</p>
                      </div>
                    )}

                    {hasAccess('measurement') && (
                      <div onClick={() => {setActiveTab('measurement'); setIsSidebarOpen(false);}} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col">
                         <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#0052FF] group-hover:text-white transition-colors shrink-0">
                            <ShoppingCart className="w-5 h-5" />
                         </div>
                         <h3 className="text-sm font-bold text-slate-900 mb-1">Work Order</h3>
                         <p className="text-[11px] font-medium text-slate-500 line-clamp-2">Create Purchase Orders and Work Orders, including itemized quantities and totals.</p>
                      </div>
                    )}

                    {hasAccess('sitemeasurement') && (
                      <div onClick={() => {setActiveTab('sitemeasurement'); setIsSidebarOpen(false);}} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col">
                         <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#0052FF] group-hover:text-white transition-colors shrink-0">
                            <Ruler className="w-5 h-5" />
                         </div>
                         <h3 className="text-sm font-bold text-slate-900 mb-1">Site Measure</h3>
                         <p className="text-[11px] font-medium text-slate-500 line-clamp-2">Log site dimensions like length and width to calculate total area measurements.</p>
                      </div>
                    )}

                    {hasAccess('vendorsummary') && (
                      <div onClick={() => {setActiveTab('vendorsummary'); setIsSidebarOpen(false);}} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col">
                         <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#0052FF] group-hover:text-white transition-colors shrink-0">
                            <Wallet className="w-5 h-5" />
                         </div>
                         <h3 className="text-sm font-bold text-slate-900 mb-1">Supplier Payments</h3>
                         <p className="text-[11px] font-medium text-slate-500 line-clamp-2">Log summary of supplier payments including already paid and current payment figures.</p>
                      </div>
                    )}

                    {hasAccess('requisition') && (
                      <div onClick={() => {setActiveTab('requisition'); setIsSidebarOpen(false);}} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col">
                         <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#0052FF] group-hover:text-white transition-colors shrink-0">
                            <FilePlus className="w-5 h-5" />
                         </div>
                         <h3 className="text-sm font-bold text-slate-900 mb-1">Purchase Req</h3>
                         <p className="text-[11px] font-medium text-slate-500 line-clamp-2">Create formal purchase requisitions with required cost centers and item categories.</p>
                      </div>
                    )}

                    {hasAccess('grn') && (
                      <div onClick={() => {setActiveTab('grn'); setIsSidebarOpen(false);}} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col">
                         <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#0052FF] group-hover:text-white transition-colors shrink-0">
                            <PackageCheck className="w-5 h-5" />
                         </div>
                         <h3 className="text-sm font-bold text-slate-900 mb-1">Good Received</h3>
                         <p className="text-[11px] font-medium text-slate-500 line-clamp-2">Log GRN (Good Received Note) tracking ordered versus delivered quantities for inventory.</p>
                      </div>
                    )}

                    {hasAccess('progressreport') && (
                      <div onClick={() => {setActiveTab('progressreport'); setIsSidebarOpen(false);}} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col">
                         <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#0052FF] group-hover:text-white transition-colors shrink-0">
                            <LineChart className="w-5 h-5" />
                         </div>
                         <h3 className="text-sm font-bold text-slate-900 mb-1">Site Progress</h3>
                         <p className="text-[11px] font-medium text-slate-500 line-clamp-2">Track daily construction progress across all site areas with detailed remarks.</p>
                      </div>
                    )}
                 </div>
              </div>
           )}

           {activeTab === 'vendor' && hasAccess('vendor') && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 print:hidden">
                   <div>
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Vendor Registration</h2>
                     <p className="text-slate-500 text-[14px] font-medium">Please fill out the form carefully. All fields are required.</p>
                   </div>
                 </div>
                 <div className="bg-white shadow-sm print:shadow-none rounded-xl overflow-x-auto overflow-y-hidden border border-slate-200 md:p-8 p-4 print:p-0 print:border-none w-full max-w-4xl">
                    <VendorRegistrationForm onSuccess={() => setActiveTab('dashboard')} />
                 </div>
              </div>
           )}

           {activeTab === 'quotation' && hasAccess('quotation') && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 print:hidden">
                   <div>
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Vendor Quotation</h2>
                     <p className="text-slate-500 text-[14px] font-medium">Submit itemized quotation estimates. Use standard units of measurement.</p>
                   </div>
                 </div>
                 <div className="bg-white shadow-sm print:shadow-none rounded-xl overflow-x-auto overflow-y-hidden border border-slate-200 md:p-8 p-4 print:p-0 print:border-none w-full max-w-5xl">
                    <VendorQuotationForm onSuccess={() => setActiveTab('dashboard')} />
                 </div>
              </div>
           )}

           {activeTab === 'manpower' && hasAccess('manpower') && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 print:hidden">
                   <div>
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Daily Manpower Deployment</h2>
                     <p className="text-slate-500 text-[14px] font-medium">Log the daily manpower distribution correctly across all active trades.</p>
                   </div>
                 </div>
                 <div className="bg-white shadow-sm print:shadow-none rounded-xl overflow-x-auto overflow-y-hidden border border-slate-200 md:p-8 p-4 print:p-0 print:border-none w-full max-w-5xl">
                    <ManpowerDeploymentForm onSuccess={() => setActiveTab('dashboard')} />
                 </div>
              </div>
           )}

           {activeTab === 'measurement' && hasAccess('measurement') && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 print:hidden">
                   <div>
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Work Order</h2>
                     <p className="text-slate-500 text-[14px] font-medium">Record final accepted measurements for work/purchase orders to process payments.</p>
                   </div>
                 </div>
                 <div className="bg-white shadow-sm print:shadow-none rounded-xl overflow-x-auto overflow-y-hidden border border-slate-200 md:p-8 p-4 print:p-0 print:border-none w-full max-w-5xl">
                    <MeasurementForm onSuccess={() => setActiveTab('dashboard')} />
                 </div>
              </div>
           )}

           {activeTab === 'sitemeasurement' && hasAccess('sitemeasurement') && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 print:hidden">
                   <div>
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Site Measurement Sheet</h2>
                     <p className="text-slate-500 text-[14px] font-medium">Log physical dimensions from the site to calculate total area requirements.</p>
                   </div>
                 </div>
                 <div className="bg-white shadow-sm print:shadow-none rounded-xl overflow-x-auto overflow-y-hidden border border-slate-200 md:p-8 p-4 print:p-0 print:border-none w-full max-w-5xl">
                    <SiteMeasurementForm onSuccess={() => setActiveTab('dashboard')} />
                 </div>
              </div>
           )}

           {activeTab === 'vendorsummary' && hasAccess('vendorsummary') && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 print:hidden">
                   <div>
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Supplier Payments Summary</h2>
                     <p className="text-slate-500 text-[14px] font-medium">Track supplier payment records including past and current payment values.</p>
                   </div>
                 </div>
                 <div className="bg-white shadow-sm print:shadow-none rounded-xl overflow-x-auto overflow-y-hidden border border-slate-200 md:p-8 p-4 print:p-0 print:border-none w-full max-w-4xl">
                    <VendorSummaryForm onSuccess={() => setActiveTab('dashboard')} />
                 </div>
              </div>
           )}

           {activeTab === 'requisition' && hasAccess('requisition') && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 print:hidden">
                   <div>
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Purchase Requisition</h2>
                     <p className="text-slate-500 text-[14px] font-medium">Submit itemized requests for materials and supplies across different cost centers.</p>
                   </div>
                 </div>
                 <div className="bg-white shadow-sm print:shadow-none rounded-xl overflow-x-auto overflow-y-hidden border border-slate-200 md:p-8 p-4 print:p-0 print:border-none w-full max-w-5xl">
                    <PurchaseRequisitionForm onSuccess={() => setActiveTab('dashboard')} />
                 </div>
              </div>
           )}

           {activeTab === 'grn' && hasAccess('grn') && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 print:hidden">
                   <div>
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Good Received Note (GRN)</h2>
                     <p className="text-slate-500 text-[14px] font-medium">Log received goods tracking ordered versus delivered quantities for inventory.</p>
                   </div>
                 </div>
                 <div className="bg-white shadow-sm print:shadow-none rounded-xl overflow-x-auto overflow-y-hidden border border-slate-200 md:p-8 p-4 print:p-0 print:border-none w-full max-w-5xl">
                    <GoodReceivedNoteForm onSuccess={() => setActiveTab('dashboard')} />
                 </div>
              </div>
           )}

           {activeTab === 'progressreport' && hasAccess('progressreport') && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 print:hidden">
                   <div>
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Daily Progress Report</h2>
                     <p className="text-slate-500 text-[14px] font-medium">Submit site-level daily construction progress logs and area remarks.</p>
                   </div>
                 </div>
                 <div className="bg-white shadow-sm print:shadow-none rounded-xl overflow-x-auto overflow-y-hidden border border-slate-200 md:p-8 p-4 print:p-0 print:border-none w-full max-w-5xl">
                    <SiteProgressReportForm onSuccess={() => setActiveTab('dashboard')} />
                 </div>
              </div>
           )}

        </div>
      </main>
    </div>
  )
}
