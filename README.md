# Simple Electron Browser

Un navigateur web simple basé sur Electron et Chromium avec les fonctionnalités de base.

## Fonctionnalités

- Barre d'URL/recherche combinée
- Boutons de navigation : reculer, avancer, recharger
- Interface utilisateur simple et intuitive
- Recherche Google automatique pour les termes non-URL

## Installation

1. Assurez-vous d'avoir Node.js installé sur votre système
2. Naviguez vers le répertoire du projet
3. Installez les dépendances :
   ```bash
   npm install
   ```

## Utilisation

Pour démarrer l'application :
```bash
npm start
```

### Fonctionnalités de la barre d'URL

- Entrez une URL complète (ex: https://www.google.com)
- Entrez un domaine simple (ex: google.com) - sera automatiquement préfixé avec https://
- Entrez des termes de recherche - sera automatiquement recherché sur Google

### Boutons de navigation

- **←** : Reculer dans l'historique de navigation
- **→** : Avancer dans l'historique de navigation  
- **⟲** : Recharger la page actuelle

Les boutons reculer/avancer sont automatiquement désactivés quand ils ne sont pas disponibles.

## Structure du projet

- `main.js` : Processus principal Electron
- `index.html` : Interface utilisateur
- `renderer.js` : Logique de navigation côté rendu
- `preload.js` : Script de préchargement pour la sécurité
- `package.json` : Configuration du projet et dépendances

## Technologies utilisées

- Electron
- HTML/CSS/JavaScript
- Chromium WebView

