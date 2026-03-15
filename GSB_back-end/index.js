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

// Configuration CORS pour autoriser le front-end Render
const corsOptions = {
    origin: [
        'https://gsb-web.onrender.com',
        'https://gsb-web-1.onrender.com',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// --- ROUTES ---

// Route d'accueil pour éviter le "Cannot GET /"
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Bienvenue sur l'API GSB",
        status: "Online",
        endpoints: ["/auth", "/users", "/bills", "/reminder"]
    });
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