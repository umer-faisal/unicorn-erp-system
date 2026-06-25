"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
    }
    // If success, the AuthContext onAuthStateChanged listener will handle redirection
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center font-sans p-6 w-full relative overflow-hidden">
       {/* Background decorative elements */}
       <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
       <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

       <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-10 relative z-10">
          
          <div className="flex flex-col items-center text-center mb-10">
             <div className="w-48 h-auto flex items-center justify-center">
                <img src="/logo.png" alt="Unicorn ERP Logo" className="w-full h-auto object-contain" />
             </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-600 font-semibold text-center">
               {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
             <div>
                <label className="block text-[11px] font-extrabold text-slate-500 mb-2 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                   <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="admin@unicorn.com" 
                     required
                     className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all placeholder:text-slate-400"
                   />
                </div>
             </div>
             
             <div>
                <label className="block text-[11px] font-extrabold text-slate-500 mb-2 uppercase tracking-wide">Password</label>
                <div className="relative">
                   <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••" 
                     required
                     className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all placeholder:text-slate-400"
                   />
                </div>
             </div>

             <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0052FF] text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 group"
                >
                  {isSubmitting ? 'Authenticating...' : 'Secure Login'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
             </div>
          </form>


       </div>
    </div>
  );
}
