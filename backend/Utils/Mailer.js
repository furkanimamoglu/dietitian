const nodemailer = require('nodemailer');
const path = require('path');
const config = require(path.join(__dirname, '..', 'config.json'));

/**
 * Mailer - Handles all email operations (Gmail via App Password).
 * @class
 * @author Furkan
 */
class Mailer {
    static transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.mailAuth.emailAddress,
            pass: config.mailAuth.emailAppPassword
        }
    });

    /**
     * Sends email via Gmail.
     * @param {string} to - Recipient email address
     * @param {string} subject - Email subject
     * @param {string} text - Plain text content
     * @param {string} html - HTML content (optional)
     * @returns {Promise<boolean>} success
     */
    static async sendMail(to, subject, text, html = null) {
        try {
            const mailOptions = {
                from: `Diyetia | <${config.mailAuth.emailAddress}>`,
                to,
                subject,
                text,
                ...(html && {html})
            };

            await Mailer.transporter.sendMail(mailOptions);
            return true;
        } catch (err) {
            console.error('❌ Email send error:', err.message);
            return false;
        }
    }
}

module.exports = Mailer;