import emailjs from '@emailjs/browser';

// ============================================================
// EmailJS Configuration — Fill in your own credentials
// ============================================================
const EMAILJS_SERVICE_ID = 'service_nv5bn9l';
const EMAILJS_TEMPLATE_ID = 'template_0jn7ujm';
const EMAILJS_PUBLIC_KEY = 'Ms3b3AazM8EZOk3m2';

/**
 * Send a notification email via EmailJS (client-side, no Cloud Functions).
 * 
 * @param {string} toEmail - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} message - Email body message
 * @returns {Promise<boolean>} - true if sent successfully, false otherwise
 */
export async function sendNotificationEmail(toEmail, subject, message) {
  // Removed placeholder check since real credentials are added

  try {
    // Fallback email if toEmail is empty (prevents EmailJS validation crash)
    const recipient = toEmail || 'admin@unicornpakistan.com';

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: recipient,
        subject: subject,
        message: message,
      },
      EMAILJS_PUBLIC_KEY
    );
    console.log(`[EmailJS] Email sent to ${recipient}`);
    return true;
  } catch (error) {
    console.error('[EmailJS] Failed to send email:', error.text || error);
    return false;
  }
}
