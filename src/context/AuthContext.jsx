"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData
            });
          } else {
             if (firebaseUser.email === 'admin@unicornpakistan.com') {
                const newAdminData = {
                   name: 'System Admin',
                   email: firebaseUser.email,
                   role: 'Admin',
                   permissions: ['vendor', 'quotation', 'manpower', 'measurement', 'sitemeasurement', 'vendorsummary', 'requisition', 'grn', 'progressreport'],
                   initials: 'SA',
                   status: 'Active',
                   createdAt: new Date().toISOString()
                };
                await setDoc(userDocRef, newAdminData);
                setUser({
                   uid: firebaseUser.uid,
                   ...newAdminData
                });
             } else {
               setUser({
                 uid: firebaseUser.uid,
                 email: firebaseUser.email,
                 role: 'User',
                 name: 'Unknown User',
                 initials: 'UU',
                 permissions: []
               });
             }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Strict role-based route protection mechanism
    if (!loading) {
      if (!user && pathname !== '/') {
        router.push('/');
      } else if (user) {
        if (pathname === '/') {
          if (user.role === 'Admin') router.push('/admin');
          else router.push('/user/dashboard');
        } else if (pathname.startsWith('/admin') && user.role !== 'Admin') {
          router.push('/user/dashboard');
        } else if (pathname.startsWith('/user') && user.role === 'Admin') {
          router.push('/admin');
        }
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error("Login Error:", error);
      // Simplify firebase error message
      let msg = error.message;
      if(error.code === 'auth/invalid-credential') msg = "Invalid Email or Password.";
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Wait for onAuthStateChanged to clear the user, then redirect
      router.push('/');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-[#0B1121] w-full">
           <div className="w-8 h-8 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
