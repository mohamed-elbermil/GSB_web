# 🎨 Système de Variables CSS GSB

Ce système permet de modifier rapidement les couleurs, polices et espacements de toute l'application depuis un seul endroit.

## 📁 Fichiers

- **`variables.css`** : Contient toutes les variables CSS globales
- **`themes.css`** : Contient les thèmes prédéfinis
- **`Auth.css`** : Utilise les variables (déjà migré)

## 🚀 Comment utiliser

### 1. Importer les variables
```css
@import url('./variables.css');
```

### 2. Utiliser les variables dans vos composants
```css
.mon-composant {
  background: var(--primary-color);
  color: var(--text-primary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
}
```

## 🎨 Variables disponibles

### Couleurs principales
- `--primary-color` : Couleur principale (#667eea)
- `--secondary-color` : Couleur secondaire (#764ba2)
- `--bg-primary` : Fond principal (#ffffff)
- `--bg-secondary` : Fond secondaire (#f8f9fa)
- `--text-primary` : Texte principal (#2c3440)
- `--text-secondary` : Texte secondaire (#64748b)

### Espacements
- `--spacing-xs` : 4px
- `--spacing-sm` : 8px
- `--spacing-md` : 12px
- `--spacing-lg` : 16px
- `--spacing-xl` : 24px
- `--spacing-2xl` : 32px

### Tailles de police
- `--font-size-xs` : 12px
- `--font-size-sm` : 14px
- `--font-size-base` : 16px
- `--font-size-lg` : 18px
- `--font-size-xl` : 20px

### Bordures
- `--border-radius-sm` : 6px
- `--border-radius-md` : 8px
- `--border-radius-lg` : 12px
- `--border-radius-xl` : 16px

## 🌈 Thèmes disponibles

### Thème clair (par défaut)
```html
<html>
```

### Thème sombre
```html
<html data-theme="dark">
```

### Thème bleu
```html
<html data-theme="blue">
```

### Thème vert
```html
<html data-theme="green">
```

### Thème rouge
```html
<html data-theme="red">
```

### Thème orange
```html
<html data-theme="orange">
```

## 🔄 Comment changer de thème dynamiquement

```javascript
// Changer vers le thème sombre
document.documentElement.setAttribute('data-theme', 'dark');

// Changer vers le thème bleu
document.documentElement.setAttribute('data-theme', 'blue');

// Revenir au thème par défaut
document.documentElement.removeAttribute('data-theme');
```

## 🎯 Exemples d'utilisation

### Boutons
```css
.btn-primary {
  background: var(--primary-color);
  color: var(--text-white);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

### Cartes
```css
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
}
```

### Messages
```css
.success-message {
  background: var(--success-bg);
  color: var(--success-color);
  border: 1px solid var(--success-border);
}

.error-message {
  background: var(--error-bg);
  color: var(--error-color);
  border: 1px solid var(--error-border);
}
```

## 💡 Avantages

1. **Maintenance facile** : Changez une couleur et elle se met à jour partout
2. **Cohérence visuelle** : Espacements et tailles uniformes
3. **Thèmes multiples** : Basculez facilement entre différents thèmes
4. **Accessibilité** : Variables sémantiques pour une meilleure compréhension
5. **Performance** : Moins de répétition de code CSS

## 🔧 Personnalisation

Pour modifier les couleurs par défaut, éditez `variables.css` :

```css
:root {
  --primary-color: #votre-couleur;
  --secondary-color: #votre-couleur-secondaire;
  /* etc... */
}
```

Pour ajouter un nouveau thème, éditez `themes.css` :

```css
[data-theme="mon-theme"] {
  --primary-color: #ma-couleur;
  --secondary-color: #ma-couleur-secondaire;
  /* etc... */
}
```

## 📝 Notes

- Les variables suivent la norme CSS Custom Properties
- Compatible avec tous les navigateurs modernes
- Fallback automatique pour les anciens navigateurs
- Utilisez toujours `var(--nom-variable)` pour référencer une variable
