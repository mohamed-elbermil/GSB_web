# GSB 

## Présentation du Projet

GSB est une application web de gestion permettant aux utilisateurs de gérer leurs rendez-vous, factures et rappels. Le projet offre une interface moderne pour la gestion administrative avec un système d'authentification sécurisé et des fonctionnalités de planification.

## Stack Technique

### Back-end
| Technologie | Version | Description |
|-------------|---------|-------------|
| Node.js | - | Runtime JavaScript |
| Express | 5.1.0 | Framework web |
| MongoDB | 7.1.0 | Base de données NoSQL |
| Mongoose | 8.13.2 | ODM MongoDB |
| JWT | 9.0.2 | Authentification |
| CORS | 2.8.5 | Gestion des requêtes cross-origin |
| dotenv | 16.5.0 | Gestion des variables d'environnement |
| Multer | 1.4.5-lts.2 | Upload de fichiers |
| Nodemailer | 7.0.3 | Envoi d'emails |
| Node-cron | 4.1.1 | Tâches planifiées |

### Front-end
| Technologie | Version | Description |
|-------------|---------|-------------|
| React | 18.2.0 | Bibliothèque UI |
| Vite | 6.3.5 | Build tool et dev server |
| React Router | 7.6.0 | Routage client |
| Chart.js | 4.4.0 | Graphiques et visualisations |
| React Icons | 5.5.0 | Icônes |
| React Datepicker | 8.3.0 | Sélecteur de dates |

## Architecture du Projet

Le projet suit une architecture client-serveur avec une séparation claire entre le front-end et le back-end :

```
GSB/
├── GSB_back-end/           # API REST et logique métier
│   ├── controllers/         # Contrôleurs des routes
│   ├── models/            # Schémas Mongoose
│   ├── routes/            # Définition des routes API
│   ├── middlewares/       # Middlewares d'authentification
│   ├── services/          # Services métier
│   ├── utils/             # Utilitaires
│   ├── cron/              # Tâches planifiées
│   ├── index.js           # Point d'entrée serveur
│   └── .env               # Variables d'environnement
└── GSB_front-end/         # Application React
    ├── src/
    │   ├── components/    # Composants React
    │   ├── pages/         # Pages de l'application
    │   ├── services/      # Services API
    │   ├── utils/         # Utilitaires
    │   └── App.jsx        # Composant racine
    ├── public/            # Fichiers statiques
    └── vite.config.js     # Configuration Vite
```

## Guide d'Installation

### Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- MongoDB Atlas ou MongoDB local

### Configuration du Back-end

1. Naviguez vers le dossier back-end :
```bash
cd GSB_back-end
```

2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env` avec les variables suivantes :
```env
PORT=3000
MONGODB_URI=votre_uri_mongodb_atlas
JWT_SECRET=votre_cle_secrete_jwt
EMAIL_HOST=votre_serveur_email
EMAIL_PORT=587
EMAIL_USER=votre_email
EMAIL_PASS=votre_mot_de_passe_email
```

4. Démarrez le serveur back-end :
```bash
npm start
```

### Configuration du Front-end

1. Naviguez vers le dossier front-end :
```bash
cd GSB_front-end
```

2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env` pour la configuration de l'API :
```env
VITE_API_URL=http://localhost:3000
```

4. Démarrez le serveur de développement :
```bash
npm run dev
```

## Documentation API & Fonctionnement

### Communication Front-end/Back-end

- Le front-end (port 5173) communique avec le back-end (port 3000) via des requêtes HTTP REST
- CORS est configuré pour autoriser les requêtes depuis le domaine du front-end
- Vite est configuré avec un proxy pour rediriger les requêtes API vers le back-end

### Endpoints Principaux

- `POST /auth/login` - Authentification des utilisateurs
- `GET /users/profile` - Récupération du profil utilisateur
- `GET /bills` - Liste des factures
- `POST /reminder` - Création de rappels
- `GET /reminder` - Liste des rappels

## Rôles et Sécurité

### Gestion des Utilisateurs

- Système d'authentification basé sur JWT (JSON Web Tokens)
- Hashage des mots de passe avec SHA-256
- Middleware de vérification des tokens pour les routes protégées

### Sécurité

- Configuration de whitelist IP sur MongoDB Atlas pour restreindre l'accès
- Utilisation de variables d'environnement pour les données sensibles
- Validation des entrées utilisateur côté back-end
- Configuration CORS restrictive

## Lancement

### Mode Développement

Pour démarrer l'application complète en mode développement :

1. Terminal 1 - Back-end :
```bash
cd GSB_back-end
npm start
```

2. Terminal 2 - Front-end :
```bash
cd GSB_front-end
npm run dev
```

L'application sera accessible :
- Front-end : http://localhost:5173
- Back-end API : http://localhost:3000

### Mode Production

Pour le déploiement en production :
1. Build du front-end : `npm run build` (dans GSB_front-end)
2. Configuration des variables d'environnement de production
3. Déploiement du back-end avec un process manager comme PM2
4. Configuration d'un serveur web (Nginx/Apache) pour servir les fichiers statiques
