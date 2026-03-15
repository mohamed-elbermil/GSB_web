require('dotenv').config();  // Charge les variables d’environnement depuis .env
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
});

/**
 * Envoie un email via le transporteur configuré
 * @param {Object} options
 * @param {string} options.to - destinataire
 * @param {string} options.subject - sujet
 * @param {string} options.text - contenu texte
 */
async function sendEmail({ to, subject, text }) {
  try {
    const mailOptions = {
      from: `"Facturation" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Mail envoyé à ${to} (${info.messageId})`);
  } catch (error) {
    console.error(`❌ Erreur envoi mail à ${to} :`, error.message);
  }
}

module.exports = sendEmail;
