const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Test de connexion MongoDB
const mongoUri = process.env.MONGODB_URL || process.env.MONGODB_URI || process.env.DATABASE_URL;

console.log('Tentative de connexion à MongoDB avec URI:', mongoUri ? 'URI trouvée' : 'URI non trouvée');

if (!mongoUri) {
    console.error('ERREUR: Aucune URI MongoDB trouvée');
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => {
        console.log('✅ Connecté à MongoDB avec succès!');
        
        // Route de test
        app.get('/', (req, res) => {
            res.json({ 
                message: 'GSB API is running!',
                timestamp: new Date().toISOString(),
                mongoStatus: 'Connected'
            });
        });

        app.listen(port, () => {
            console.log(`🚀 Serveur démarré sur le port ${port}`);
        });
    })
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB:', err);
        process.exit(1);
    });
