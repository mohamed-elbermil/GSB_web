# 🚀 Déploiement GSB - Guide Complet

## Architecture
- **Front-end** : React + Vite (Vercel)
- **Back-end** : Node.js + Express (Railway)
- **Database** : MongoDB (Railway)

## Étapes de Déploiement

### 1. Back-end sur Railway
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Déployer
cd GSB_back-end
railway init
railway up

# Configurer les variables
railway variables set MONGODB_URI="mongodb+srv://..."
railway variables set JWT_SECRET="your-secret-key"
railway variables set PORT=3000
```

### 2. Front-end sur Vercel
```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
cd GSB_front-end
vercel --prod

# Configurer l'URL de l'API
vercel env add VITE_API_URL production
# Valeur: https://your-app.railway.app
```

### 3. Configuration MongoDB
1. Créer un cluster sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Ajouter l'IP Railway (0.0.0.0/0)
3. Créer un utilisateur avec mot de passe
4. Copier la chaîne de connexion

## Variables d'Environnement

### Back-end (Railway)
- `MONGODB_URI` : Chaîne de connexion MongoDB
- `JWT_SECRET` : Clé secrète pour JWT
- `PORT` : Port du serveur (3000)
- `BUCKET_NAME` : Nom du bucket S3 (optionnel)
- `ID` : Clé d'accès AWS (optionnel)
- `SECRET` : Secret AWS (optionnel)

### Front-end (Vercel)
- `VITE_API_URL` : URL de l'API Railway

## Domaines Personnalisés

### Railway
1. Settings → Domains
2. Ajouter `api.votredomaine.com`
3. Configurer DNS : CNAME → railway.app

### Vercel
1. Dashboard → Domains
2. Ajouter `votredomaine.com`
3. Configurer DNS : CNAME → cname.vercel-dns.com

## Monitoring

### Railway
- Logs disponibles dans la console
- Métriques d'utilisation
- Health checks automatiques

### Vercel
- Analytics intégrés
- Performance monitoring
- Error tracking

## Sécurité

1. **HTTPS** : Activé par défaut
2. **CORS** : Configuré dans le back-end
3. **JWT** : Tokens sécurisés
4. **Environment variables** : Encrypted

## Coûts Estimés

### Gratuit (limites)
- **Railway** : 500h/mois, $5 crédit
- **Vercel** : 100GB bandwidth, 100 builds/mois
- **MongoDB Atlas** : 512MB storage

### Production (recommandé)
- **Railway** : $20/mois
- **Vercel** : $20/mois (si besoin)
- **MongoDB Atlas** : $9/mois (M0 cluster)

**Total : ~$29/mois pour la production complète**

## Support

- **Railway** : Discord + Email
- **Vercel** : Support 24/7 (plans payants)
- **MongoDB Atlas** : Documentation communautaire
