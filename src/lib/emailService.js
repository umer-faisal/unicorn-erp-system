import emailjs from '@emailjs/browser';

// ============================================================
// EmailJS Configuration — Fill in your own credentials
// ============================================================
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

/**
 * Send a notification email via EmailJS (client-side, no Cloud Functions).
 * 
 * @param {string} toEmail - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} message - Email body message
 * @returns {Promise<boolean>} - true if sent successfully, false otherwise
 */
export async function sendNotificationEmail(toEmail, subject, message) {
  // Skip if placeholder credentials haven't been replaced
  if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || 
      EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || 
      EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    console.warn('[EmailJS] Skipping email — placeholder credentials detected. Please update src/lib/emailService.js with your real EmailJS IDs.');
    return false;
  }

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: toEmail,
        subject: subject,
        message: message,
      },
      EMAILJS_PUBLIC_KEY
    );
    console.log(`[EmailJS] Email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[EmailJS] Failed to send email:', error);
    return false;
  }
}
