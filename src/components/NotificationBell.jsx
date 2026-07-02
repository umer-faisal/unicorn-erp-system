"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setNotifications, markAsRead, markAllAsRead } from '@/store/slices/notificationSlice';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch, or } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function NotificationBell() {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notification);
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time Firestore listener — single query with OR for role-based + user-specific
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      or(
        where('recipientRole', '==', user.role),
        where('recipientUserId', '==', user.uid)
      ),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      dispatch(setNotifications(data));
    }, (error) => {
      // If index not yet created, fall back to role-only query
      console.error('[NotificationBell] Listener error:', error);
      const fallbackQ = query(
        collection(db, 'notifications'),
        where('recipientRole', '==', user.role),
        orderBy('createdAt', 'desc')
      );
      onSnapshot(fallbackQ, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        dispatch(setNotifications(data));
      });
    });

    return () => unsubscribe();
  }, [user, dispatch]);

  const handleMarkAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
      dispatch(markAsRead(notifId));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications
        .filter(n => !n.isRead)
        .forEach(n => {
          batch.update(doc(db, 'notifications', n.id), { isRead: true });
        });
      await batch.commit();
      dispatch(markAllAsRead());
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formTypeLabels = {
    requisition: 'Purchase Requisition',
    purchaserequisition: 'Purchase Requisition',
    measurement: 'Work Order / PO',
    grn: 'Good Received Note',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-emerald-600 transition-colors p-2 hover:bg-emerald-50 rounded-full relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-[380px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((notif) => (
                <div
                  key={notif.id}
                  className={`px-5 py-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'
                  }`}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                >
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${notif.isRead ? 'bg-slate-300' : 'bg-blue-500 animate-pulse'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] leading-snug ${notif.isRead ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {formTypeLabels[notif.relatedFormType] || notif.relatedFormType}
                      </span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] font-semibold text-slate-400">{formatTime(notif.createdAt)}</span>
                    </div>
                  </div>
                  {!notif.isRead && (
                    <button className="text-blue-400 hover:text-blue-600 p-1 shrink-0" title="Mark as read">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
