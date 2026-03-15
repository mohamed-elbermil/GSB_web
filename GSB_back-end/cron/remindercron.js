const cron = require('node-cron');
const sendReminderEmails = require('../services/Sendreminder');

function startReminderJob() {
  cron.schedule('0 8 * * 1', () => {
    console.log(" Lancement du job de rappel de factures...");
    sendReminderEmails();
  });
}

module.exports = startReminderJob;
