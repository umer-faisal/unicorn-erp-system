"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, setDoc, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, secondaryAuth } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, setUsersList, setSelectedDbForm, setSubmissions, setIsFetchingSubmissions } from '@/store/slices/adminSlice';
import FormViewerModal from '@/components/FormViewerModal';
import NotificationBell from '@/components/NotificationBell';
import { 
  Users, 
  LogOut, 
  Trash2, 
  FileSpreadsheet, 
  FileText, 
  Key, 
  Bell, 
  UserPlus,
  Database,
  Edit2,
  X,
  CheckSquare,
  ArrowLeft,
  Download,
  Calendar,
  Filter,
  ShoppingCart,
  Ruler,
  Wallet,
  FilePlus,
  PackageCheck,
  LineChart,
  ReceiptText,
  Menu
} from 'lucide-react';

const ALL_WORKFLOWS = [
  { id: 'vendor', label: 'Vendor Registration' },
  { id: 'quotation', label: 'Vendor Quotation' },
  { id: 'manpower', label: 'Daily Manpower' },
  { id: 'measurement', label: 'Work Order' },
  { id: 'sitemeasurement', label: 'Site Measurements' },
  { id: 'vendorsummary', label: 'Supplier Payments' },
  { id: 'requisition', label: 'Purchase Requisition' },
  { id: 'grn', label: 'Good Received Note' },
  { id: 'progressreport', label: 'Site Progress' }
];

const ICONS = {
  vendor: FileText,
  quotation: ReceiptText,
  manpower: Users,
  measurement: ShoppingCart,
  sitemeasurement: Ruler,
  vendorsummary: Wallet,
  requisition: FilePlus,
  grn: PackageCheck,
  progressreport: LineChart,
};

const DEFAULT_OFFICE_MANAGER_PERMS = ['dashboard', 'vendor', 'quotation', 'measurement', 'vendorsummary'];
const DEFAULT_PROJECT_MANAGER_PERMS = ['dashboard', 'manpower', 'progressreport', 'requisition', 'sitemeasurement'];
const DEFAULT_STORE_MANAGER_PERMS = ['dashboard', 'grn'];

export default function AdminControlCenter() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const { usersList, submissions, isFetchingSubmissions, selectedDbForm, activeTab } = useSelector((state) => state.admin);

  const localSetActiveTab = (val) => dispatch(setActiveTab(val));
  const localSetUsersList = (val) => dispatch(setUsersList(val));
  const localSetSelectedDbForm = (val) => dispatch(setSelectedDbForm(val));
  const localSetSubmissions = (val) => dispatch(setSubmissions(val));
  const localSetIsFetchingSubmissions = (val) => dispatch(setIsFetchingSubmissions(val));

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    role: 'Office Manager',
    permissions: DEFAULT_OFFICE_MANAGER_PERMS
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ 
    id: '', 
    fullName: '', 
    email: '', 
    role: 'Office Manager',
    permissions: []
  });

  // Central Database States
  const [dbRole, setDbRole] = useState('Office Manager');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [viewingRecord, setViewingRecord] = useState(null);

  useEffect(() => {
    if (selectedDbForm) {
      const fetchSubmissions = async () => {
        localSetIsFetchingSubmissions(true);
        try {
           const q = query(collection(db, 'submissions'), where('formId', '==', selectedDbForm));
           const snapshot = await getDocs(q);
           const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
           data.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
           localSetSubmissions(data);
        } catch (error) {
           console.error("Error fetching submissions:", error);
        } finally {
           localSetIsFetchingSubmissions(false);
        }
      };
      fetchSubmissions();
    } else {
      localSetSubmissions([]);
    }
  }, [selectedDbForm, dispatch]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      localSetUsersList(users);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!loading) {
       if (!user || user.role !== 'Admin') {
         router.push('/');
       } else {
         fetchUsers();
       }
    }
  }, [user, loading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role') {
      let perms = [];
      if (value === 'Office Manager') perms = [...DEFAULT_OFFICE_MANAGER_PERMS];
      else if (value === 'Project Manager') perms = [...DEFAULT_PROJECT_MANAGER_PERMS];
      else if (value === 'Store Manager') perms = [...DEFAULT_STORE_MANAGER_PERMS];
      else if (value === 'Admin') perms = ALL_WORKFLOWS.map(wf => wf.id);

      setFormData(prev => ({ 
        ...prev, 
        role: value, 
        permissions: perms 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreatePermissionToggle = (workflowId) => {
    setFormData(prev => {
      const perms = prev.permissions.includes(workflowId)
        ? prev.permissions.filter(p => p !== workflowId)
        : [...prev.permissions, workflowId];
      return { ...prev, permissions: perms };
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role') {
      let perms = [];
      if (value === 'Office Manager') perms = [...DEFAULT_OFFICE_MANAGER_PERMS];
      else if (value === 'Project Manager') perms = [...DEFAULT_PROJECT_MANAGER_PERMS];
      else if (value === 'Store Manager') perms = [...DEFAULT_STORE_MANAGER_PERMS];
      else if (value === 'Admin') perms = ALL_WORKFLOWS.map(wf => wf.id);

      setEditFormData(prev => ({ 
        ...prev, 
        role: value, 
        permissions: perms 
      }));
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditPermissionToggle = (workflowId) => {
    setEditFormData(prev => {
      const perms = prev.permissions.includes(workflowId)
        ? prev.permissions.filter(p => p !== workflowId)
        : [...prev.permissions, workflowId];
      return { ...prev, permissions: perms };
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsProvisioning(true);
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      const { uid, user: newUserProfile } = data;
      
      setUsersList(prev => [{ id: uid, ...newUserProfile }, ...prev]);
      
      setFormData({ 
        fullName: '', 
        email: '', 
        password: '', 
        role: 'Office Manager',
        permissions: DEFAULT_OFFICE_MANAGER_PERMS
      });
      toast.success('User account created successfully!');
    } catch (error) {
      console.error("Error creating user: ", error);
      toast.error('Failed to create user: ' + error.message);
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleDeleteUser = async (id) => {
     if (confirm("Are you sure you want to delete this user? This will completely remove them from the database and authentication.")) {
         try {
           const response = await fetch(`/api/users/delete?id=${id}`, {
             method: 'DELETE'
           });
           
           const data = await response.json();
           if (!response.ok) {
             throw new Error(data.error || 'Failed to delete user');
           }

           setUsersList(prev => prev.filter(u => u.id !== id));
           toast.success("User deleted successfully!");
        } catch (error) {
           toast.error('Error deleting user: ' + error.message);
        }
     }
  };

  const openEditModal = (u) => {
     setEditFormData({ id: u.id, fullName: u.name, email: u.email, role: u.role, permissions: u.permissions || [] });
     setShowEditModal(true);
  };

  const handleEditUser = async (e) => {
     e.preventDefault();
     try {
       const response = await fetch('/api/users/update', {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(editFormData)
       });

       const data = await response.json();
       if (!response.ok) {
         throw new Error(data.error || 'Failed to update user');
       }
       
       setUsersList(prev => prev.map(u => 
          u.id === editFormData.id 
            ? { ...u, name: editFormData.fullName, email: editFormData.email, role: editFormData.role, permissions: editFormData.permissions } 
            : u
       ));
       setShowEditModal(false);
       toast.success("User account updated successfully!");
     } catch(error) {
       toast.error("Error updating user: " + error.message);
     }
  };

  const handlePasswordChange = (e) => {
     e.preventDefault();
     toast.success("Password successfully updated in the database!");
     setShowPasswordModal(false);
     setNewPassword('');
  };

  const handleExportRecords = (format, type) => {
    if (type === 'filtered' && (!exportStartDate || !exportEndDate)) {
      toast.warning("Please select both Start Date and End Date for filtered export.");
      return;
    }
    
    let recordsToExport = submissions;
    
    if (type === 'filtered') {
       const start = new Date(exportStartDate).setHours(0,0,0,0);
       const end = new Date(exportEndDate).setHours(23,59,59,999);
       recordsToExport = submissions.filter(sub => {
          const subDate = new Date(sub.submittedAt).getTime();
          return subDate >= start && subDate <= end;
       });
    }

    if (recordsToExport.length === 0) {
      toast.warning("No records found to export.");
      return;
    }

    // Generate CSV
    const headers = Array.from(new Set(recordsToExport.flatMap(r => Object.keys(r))));
    const csvRows = [];
    csvRows.push(headers.join(',')); // header row
    
    for (const row of recordsToExport) {
       const values = headers.map(header => {
          const val = row[header];
          if (val === undefined || val === null) return '';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
       });
       csvRows.push(values.join(','));
    }

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDbForm}_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Records exported successfully!");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 w-full">
         <div className="w-8 h-8 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 w-full relative overflow-x-hidden">
      
      {/* Password Change Modal */}
      {showPasswordModal && (
         <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-100">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#0052FF]">
                     <Key className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-xl font-extrabold text-slate-900">Change Password</h3>
                     <p className="text-sm font-medium text-slate-500">Update your Admin credentials</p>
                  </div>
               </div>
               <form onSubmit={handlePasswordChange}>
                  <div className="space-y-5">
                     <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">Account Email (Developer Only)</label>
                        <input type="email" value={user.email} disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed" />
                     </div>
                     <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">New Password</label>
                        <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all" placeholder="Enter new secure password" />
                     </div>
                  </div>
                  <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                     <button type="button" onClick={() => setShowPasswordModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                     <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#0052FF] hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20">Update Password</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
         <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-100 relative my-8">
               <button type="button" onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
               </button>
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#0052FF]">
                     <Edit2 className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-xl font-extrabold text-slate-900">Edit User</h3>
                     <p className="text-sm font-medium text-slate-500">Update access & roles</p>
                  </div>
               </div>
               <form onSubmit={handleEditUser}>
                  <div className="space-y-5">
                     <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">Full Name</label>
                        <input type="text" name="fullName" required value={editFormData.fullName} onChange={handleEditInputChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all" />
                     </div>
                     <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">Email Address</label>
                        <input type="email" name="email" required value={editFormData.email} onChange={handleEditInputChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all" />
                     </div>
                     <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 mb-2.5 uppercase tracking-widest">Assign Role</label>
                        <select
                           name="role"
                           value={editFormData.role}
                           onChange={handleEditInputChange}
                           className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all text-slate-900 font-bold"
                           required
                        >
                           <option value="Admin">Admin</option>
                           <option value="Office Manager">Office Manager</option>
                           <option value="Project Manager">Project Manager</option>
                           <option value="Store Manager">Store Manager</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 mb-2.5 uppercase tracking-widest">Custom Permissions</label>
                        <div className="grid grid-cols-1 gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                          {ALL_WORKFLOWS.map((wf) => (
                             <label key={wf.id} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${editFormData.permissions.includes(wf.id) ? 'bg-[#0052FF] border-[#0052FF]' : 'border-slate-300 bg-white group-hover:border-[#0052FF]'}`}>
                                   {editFormData.permissions.includes(wf.id) && <CheckSquare className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-[13px] font-semibold text-slate-700">{wf.label}</span>
                                <input 
                                  type="checkbox" 
                                  className="hidden" 
                                  checked={editFormData.permissions.includes(wf.id)}
                                  onChange={() => handleEditPermissionToggle(wf.id)}
                                />
                             </label>
                          ))}
                        </div>
                     </div>
                  </div>
                  <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                     <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                     <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#0052FF] hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20">Save Changes</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Dynamic Left Sidebar */}
      <aside className={`w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 z-40 shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 print:hidden`}>
        <div className="p-8 border-b border-slate-800/60 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo-svg.png" alt="Logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-white font-extrabold text-xl tracking-tight">Admin Console</h1>
            </div>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-8">
          <p className="px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4">System Access</p>
          
          <button 
             onClick={() => {localSetActiveTab('users'); setIsSidebarOpen(false);}}
             className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[13px] font-extrabold transition-all ${activeTab === 'users' ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'}`}
          >
             <Users className="w-4 h-4" /> User Management
          </button>

          <button 
             onClick={() => {localSetActiveTab('database'); setIsSidebarOpen(false);}}
             className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[13px] font-extrabold transition-all ${activeTab === 'database' ? 'bg-[#0052FF] text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'}`}
          >
             <Database className="w-4 h-4" /> Central Database
          </button>
        </nav>

        {/* Dynamic User Profile & Actions */}
        <div className="p-4 m-5 bg-slate-800/40 rounded-2xl border border-slate-700/50 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-1">
             <div className="w-10 h-10 rounded-full bg-[#0052FF] flex items-center justify-center text-white font-extrabold text-sm shadow-inner overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || 'Admin'}`} alt="Avatar" className="w-full h-full object-cover" />
             </div>
             <div className="overflow-hidden">
               <p className="text-white text-[13px] font-bold leading-tight truncate">{user.name}</p>
               <p className="text-slate-400 text-[11px] font-medium truncate mt-0.5">{user.email}</p>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-700/60">
             <button onClick={() => setShowPasswordModal(true)} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-700/40 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold transition-all uppercase tracking-wider">
                <Key className="w-3.5 h-3.5" /> Password
             </button>
             <button onClick={logout} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-[11px] font-bold transition-all uppercase tracking-wider">
                <LogOut className="w-3.5 h-3.5" /> Logout
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full md:ml-64 flex flex-col min-h-screen print:ml-0 print:block print:w-full">
        {/* Dynamic Top Navbar */}
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
            <NotificationBell />
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email || 'Admin'}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Dashboard Inner Content */}
        <div className="p-4 md:p-10 max-w-[1400px] mx-auto w-full print:hidden">
           
           {activeTab === 'users' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {/* Users Tab Header */}
                 <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                   <div>
                     <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">User Management</h2>
                     <p className="text-slate-500 text-[14px] font-medium">Provision new operators, manage system access and assign roles.</p>
                   </div>
                 </div>

                 {/* Core Panels Grid */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   
                   {/* User Provisioning Form (Left Column) */}
                   <div className="bg-white rounded-2xl border border-slate-200 shadow-sm col-span-1 flex flex-col h-[750px]">
                     <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 rounded-t-2xl">
                       <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <UserPlus className="w-5 h-5 text-[#0052FF]" />
                       </div>
                       <h3 className="font-extrabold text-slate-900 text-lg">User Provisioning</h3>
                     </div>
                     <form onSubmit={handleCreateUser} className="p-8 flex-1 flex flex-col gap-5 overflow-y-auto">
                       <div>
                         <label className="block text-[11px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">Full Name</label>
                         <input
                           type="text"
                           name="fullName"
                           value={formData.fullName}
                           onChange={handleInputChange}
                           placeholder="e.g. Robert Construction"
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all placeholder:text-slate-400 font-bold text-slate-900"
                           required
                         />
                       </div>
                       <div>
                         <label className="block text-[11px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">Email Address</label>
                         <input
                           type="email"
                           name="email"
                           value={formData.email}
                           onChange={handleInputChange}
                           placeholder="supervisor@unicorn.com"
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all placeholder:text-slate-400 font-bold text-slate-900"
                           required
                         />
                       </div>
                       <div>
                         <label className="block text-[11px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">Assign Role</label>
                         <select
                           name="role"
                           value={formData.role}
                           onChange={handleInputChange}
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all text-slate-900 font-bold"
                           required
                         >
                            <option value="Admin">Admin</option>
                            <option value="Office Manager">Office Manager</option>
                            <option value="Project Manager">Project Manager</option>
                            <option value="Store Manager">Store Manager</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-[11px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">Custom Permissions</label>
                         <div className="grid grid-cols-1 gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                           {ALL_WORKFLOWS.map((wf) => (
                              <label key={wf.id} className="flex items-center gap-3 cursor-pointer group">
                                 <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.permissions.includes(wf.id) ? 'bg-[#0052FF] border-[#0052FF]' : 'border-slate-300 bg-white group-hover:border-[#0052FF]'}`}>
                                    {formData.permissions.includes(wf.id) && <CheckSquare className="w-3 h-3 text-white" />}
                                 </div>
                                 <span className="text-[12px] font-semibold text-slate-700">{wf.label}</span>
                                 <input 
                                   type="checkbox" 
                                   className="hidden" 
                                   checked={formData.permissions.includes(wf.id)}
                                   onChange={() => handleCreatePermissionToggle(wf.id)}
                                 />
                              </label>
                           ))}
                         </div>
                       </div>
                       <div>
                         <label className="block text-[11px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">Temporary Password</label>
                         <input
                           type="password"
                           name="password"
                           value={formData.password}
                           onChange={handleInputChange}
                           placeholder="••••••••"
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all placeholder:text-slate-400 font-bold text-slate-900"
                           required
                         />
                       </div>
                       <button
                         type="submit"
                         disabled={isProvisioning}
                         className="mt-auto w-full py-4 bg-[#0B1121] text-white rounded-xl text-[13px] font-extrabold uppercase tracking-wider hover:bg-[#0052FF] transition-all disabled:opacity-70 shadow-xl shadow-blue-500/10"
                       >
                         {isProvisioning ? 'Creating Account...' : 'Create User Account'}
                       </button>
                     </form>
                   </div>

                   {/* Operator Management & Logs (Right Column spans 2) */}
                   <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
                      
                      {/* Active Operators Table */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 h-[750px]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50 rounded-t-2xl">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                               <Users className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-lg">System Users</h3>
                            <span className="bg-emerald-100 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-sm">{usersList.length} ACTIVE</span>
                          </div>
                        </div>
                        <div className="flex-1 overflow-x-auto overflow-y-auto p-2">
                           <table className="w-full text-left border-collapse">
                             <thead>
                               <tr>
                                 <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">Name</th>
                                 <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">Email</th>
                                 <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">Password</th>
                                 <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">Role & Access</th>
                                 <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                               {usersList.map((op) => (
                                 <tr key={op.id} className="hover:bg-slate-50/80 transition-colors group">
                                   <td className="px-6 py-4 text-[14px] text-slate-900 font-extrabold">{op.name}</td>
                                   <td className="px-6 py-4 text-[13px] text-slate-500 font-semibold">{op.email}</td>
                                   <td className="px-6 py-4 text-[13px] text-slate-500 font-mono font-bold tracking-wide">{op.password || '••••••••'}</td>
                                   <td className="px-6 py-4">
                                      <span className={`px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide ${op.role === 'Admin' ? 'bg-red-50 text-red-600' : op.role === 'Project Manager' ? 'bg-orange-50 text-orange-600' : op.role === 'Office Manager' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                         {op.role}
                                      </span>
                                      <div className="text-[10px] text-slate-400 mt-1 font-bold">{op.permissions?.length || 0} Tabs Allowed</div>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                     <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openEditModal(op)} className="p-2 text-slate-400 hover:text-white hover:bg-blue-500 rounded-lg transition-all shadow-sm opacity-0 group-hover:opacity-100" title="Edit User">
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteUser(op.id)} className="p-2 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-all shadow-sm opacity-0 group-hover:opacity-100" title="Delete User">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                     </div>
                                   </td>
                                 </tr>
                               ))}
                               {usersList.length === 0 && (
                                 <tr><td colSpan="4" className="text-center py-8 text-[13px] font-bold text-slate-400">No active users.</td></tr>
                               )}
                             </tbody>
                           </table>
                        </div>
                      </div>
                   </div>
                 </div>
              </div>
           )}

           {activeTab === 'database' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {!selectedDbForm ? (
                    <>
                      {/* Central Database Grid View */}
                      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                        <div>
                          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Central Database</h2>
                          <p className="text-slate-500 text-[14px] font-medium">Select a role profile to view accessible workflows and export system data.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-[12px] font-extrabold text-slate-500 uppercase tracking-widest">Role Profile:</label>
                          <select
                            value={dbRole}
                            onChange={(e) => setDbRole(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] font-bold text-slate-900 shadow-sm"
                          >
                             <option value="Admin">Admin</option>
                             <option value="Office Manager">Office Manager</option>
                             <option value="Project Manager">Project Manager</option>
                             <option value="Store Manager">Store Manager</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                         {ALL_WORKFLOWS.filter(wf => (dbRole === 'Admin' ? ALL_WORKFLOWS.map(w=>w.id) : dbRole === 'Office Manager' ? DEFAULT_OFFICE_MANAGER_PERMS : dbRole === 'Project Manager' ? DEFAULT_PROJECT_MANAGER_PERMS : DEFAULT_STORE_MANAGER_PERMS).includes(wf.id)).map(wf => {
                            const Icon = ICONS[wf.id] || FileText;
                            return (
                               <div key={wf.id} onClick={() => localSetSelectedDbForm(wf.id)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center">
                                  <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#0052FF] group-hover:text-white transition-colors">
                                     <Icon className="w-7 h-7" />
                                  </div>
                                  <h3 className="text-[14px] font-extrabold text-slate-900 mb-1">{wf.label}</h3>
                                  <p className="text-[11px] font-medium text-slate-500">View & Export Records</p>
                               </div>
                            )
                         })}
                      </div>
                    </>
                 ) : (
                    <>
                      {/* Export Screen for specific Form */}
                      <div className="mb-8">
                         <button onClick={() => { localSetSelectedDbForm(null); setExportStartDate(''); setExportEndDate(''); }} className="flex items-center gap-2 text-[13px] font-extrabold text-slate-500 hover:text-[#0052FF] transition-colors mb-4 uppercase tracking-widest">
                            <ArrowLeft className="w-4 h-4" /> Back to Database Hub
                         </button>
                         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                            <div>
                              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                                 {ALL_WORKFLOWS.find(w => w.id === selectedDbForm)?.label} <span className="text-slate-300 font-medium text-2xl mx-2">|</span> <span className="text-emerald-600 text-2xl">Exports</span>
                              </h2>
                              <p className="text-slate-500 text-[14px] font-medium">Filter and export all submitted entries for this workflow.</p>
                            </div>
                            
                            <div className="flex flex-wrap items-end gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                               <div>
                                  <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-widest px-1">Start Date</label>
                                  <div className="relative">
                                     <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                     <input type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] font-semibold text-slate-700" />
                                  </div>
                               </div>
                               <div>
                                  <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-widest px-1">End Date</label>
                                  <div className="relative">
                                     <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                     <input type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] font-semibold text-slate-700" />
                                  </div>
                               </div>
                               <button onClick={() => handleExportRecords('Excel', 'filtered')} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-[13px] font-extrabold transition-all shadow-sm">
                                  <Filter className="w-4 h-4" /> Filtered Excel
                               </button>
                               <div className="w-px h-8 bg-slate-200 mx-1"></div>
                               <button onClick={() => handleExportRecords('Excel', 'all')} className="flex items-center gap-2 px-4 py-2 bg-[#0B1121] text-white hover:bg-slate-800 rounded-xl text-[13px] font-extrabold transition-all shadow-sm">
                                  <Download className="w-4 h-4" /> Export All Excel
                               </button>
                            </div>
                         </div>
                      </div>

                      {/* Generic Mock Table */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto p-2">
                         <table className="w-full text-left border-collapse">
                            <thead>
                              <tr>
                                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">Submission Date</th>
                                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">Record ID</th>
                                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">Submitted By</th>
                                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {isFetchingSubmissions ? (
                                  <tr><td colSpan="4" className="text-center py-8 text-[13px] font-bold text-slate-400">Loading records...</td></tr>
                               ) : submissions.length === 0 ? (
                                  <tr><td colSpan="4" className="text-center py-8 text-[13px] font-bold text-slate-400">No records found.</td></tr>
                               ) : submissions.map((sub) => (
                                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                                     <td className="px-6 py-4 text-[13px] text-slate-500 font-bold">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                     <td className="px-6 py-4 text-[13px] text-[#0052FF] font-extrabold">
                                        <span onClick={() => setViewingRecord(sub)} className="cursor-pointer hover:underline underline-offset-4 decoration-2">
                                           {sub.id}
                                        </span>
                                     </td>
                                     <td className="px-6 py-4 text-[13px] text-slate-600 font-semibold">{sub.submittedBy}</td>
                                     <td className="px-6 py-4 text-right">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[11px] font-extrabold uppercase tracking-wide">Processed</span>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                    </>
                 )}
              </div>
           )}

        </div>
      </main>
      
      {/* Submissions Viewer Modal */}
      <FormViewerModal record={viewingRecord} onClose={() => setViewingRecord(null)} />

    </div>
  );
}
