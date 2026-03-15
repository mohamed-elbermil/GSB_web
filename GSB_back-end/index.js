const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');

// Import des routes
const userRoute = require('./routes/user_route');
const authenticationRoute = require('./routes/authentification_route');
const reminderRoute = require('./routes/reminder_routes');
const billRoute = require('./routes/bill_route');
// const startReminderJob = require('./cron/remindercron.js');

// Configuration du port (Render utilise process.env.PORT)
const port = process.env.PORT || 3000;

// Récupération de l'URI MongoDB depuis les variables d'environnement
const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGODB_URL;

if (!mongoUri) {
    console.error('CRITICAL: No MongoDB connection string found in environment variables!');
    process.exit(1);
}

// Connexion à MongoDB
mongoose.connect(mongoUri)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ Error connecting to MongoDB:', err));

// Middlewares
app.use(express.json());
app.use(cors());

// --- ROUTES ---

// Route d'accueil pour éviter le "Cannot GET /"
app.use((req, res, next) => {
    // Si on accède à la racine, on renvoie un message de bienvenue
    if (req.url === '/') {
        return res.status(200).json({
            message: "Bienvenue sur l'API GSB",
            status: "Online",
            endpoints: ["/auth", "/users", "/bills", "/reminder"]
        });
    }
    next();
});

// Routes de l'application
app.use('/users', userRoute);
app.use('/auth', authenticationRoute);
app.use('/bills', billRoute);
app.use('/reminder', reminderRoute);

// Gestion des erreurs 404 (Route non trouvée)
app.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée. Vérifiez l'URL." });
});

// Lancement du serveur
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});