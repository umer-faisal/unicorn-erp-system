import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Fetch the email address of the first user found with the specified role.
 * @param {string} role - Target role (e.g. 'Office Manager')
 * @returns {Promise<string>} - Returns the email, or empty string if not found
 */
export async function fetchEmailByRole(role) {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data().email || '';
    }
    return '';
  } catch (error) {
    console.error('[NotificationService] Error fetching email by role:', error);
    return '';
  }
}

/**
 * Create a notification document in the 'notifications' Firestore collection.
 * 
 * @param {Object} data
 * @param {string} data.recipientRole - Target role (e.g. 'Office Manager', 'Admin', 'Project Manager')
 * @param {string|null} data.recipientUserId - Specific user ID, or null for role-based
 * @param {string} data.message - Notification message text
 * @param {string} data.relatedDocId - The submission document ID this relates to
 * @param {string} data.relatedFormType - Form type (e.g. 'requisition', 'measurement', 'grn')
 * @returns {Promise<string|null>} - The created notification doc ID, or null on error
 */
export async function createNotification({ recipientRole, recipientUserId = null, message, relatedDocId, relatedFormType }) {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      recipientRole,
      recipientUserId,
      message,
      relatedDocId,
      relatedFormType,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error);
    return null;
  }
}
