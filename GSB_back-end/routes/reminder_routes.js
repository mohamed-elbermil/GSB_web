const express = require('express');
const router = express.Router();
const sendReminderEmails = require('../services/Sendreminder');

router.post('/send-reminders', async (req, res) => {
  try {
    await sendReminderEmails();
    res.status(200).json({ message: 'Rappels envoyés avec succès !' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'envoi des rappels." });
  }
});

module.exports = router;
