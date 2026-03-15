require('dotenv').config();  // charge les variables d'env si tu utilises dotenv
const sendEmail = require('./utils/sendEmail');

async function test() {
  await sendEmail({
    to: 'melbermil@outlook.fr',  // mets ici TON email pour recevoir le test
    subject: 'Test',
    text: 'Ceci est un test pour vérifier que l’envoi de mail fonctionne.'
  });
  console.log('Test d’envoi mail terminé.');
}

test();
