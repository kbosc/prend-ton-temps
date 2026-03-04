# 🕐 Prend Ton Temps

Jeu de cartes stratégique multijoueur en temps réel (React + Socket.io).

## Structure

```
prend-ton-temps/
├── client/   # Front React + Vite + Tailwind
├── server/   # Back Node.js + Socket.io + Express
└── shared/   # Types & logique partagés
```

## Développement local

```bash
npm install
npm run dev
```

- Client : http://localhost:5173
- Serveur : http://localhost:3001

## Tests

```bash
npm test                    # Tous les tests
npm run test:client         # Tests client uniquement
npm run test:server         # Tests serveur uniquement
npm run test:shared         # Tests shared uniquement
```

---

## 🚀 Déploiement en production

### Architecture

- **Client** → GitHub Pages (statique)
- **Serveur** → Hébergement Node.js (Railway, Render, Fly.io, VPS…)

### 1. Déployer le serveur

Le serveur doit être déployé sur une plateforme supportant Node.js avec WebSocket.

**Variables d'environnement serveur :**
| Variable | Description | Exemple |
|---|---|---|
| `PORT` | Port d'écoute | `3001` |
| `CLIENT_URL` | URL du client en production | `https://monpseudo.github.io` |

**Exemple avec Railway :**
1. Créer un projet Railway → connecter le repo GitHub
2. Sélectionner le dossier `server`
3. Ajouter les variables d'env ci-dessus
4. Railway détecte automatiquement Node.js et lance `npm start`

### 2. Déployer le client sur GitHub Pages

#### Étape 1 — Activer GitHub Pages

1. Aller dans **Settings → Pages** du repo
2. Source : **GitHub Actions**

#### Étape 2 — Configurer les variables GitHub

Aller dans **Settings → Variables → Repository variables** et créer :

| Variable | Valeur | Description |
|---|---|---|
| `VITE_SERVER_URL` | `https://ton-serveur.railway.app` | URL complète de ton serveur |
| `VITE_BASE_URL` | `/prend-ton-temps` | Nom du repo (avec `/`) |

#### Étape 3 — Pusher sur `main`

```bash
git add .
git commit -m "feat: deploy"
git push origin main
```

Le workflow **Deploy to GitHub Pages** se déclenche automatiquement.

#### Étape 4 — Accéder au site

```
https://<ton-pseudo-github>.github.io/prend-ton-temps/
```

---

### Pipeline CI/CD

| Workflow | Déclencheur | Action |
|---|---|---|
| `ci.yml` | Push sur `main`/`develop` ou PR | Tests + build de vérification |
| `deploy.yml` | Push sur `main` uniquement | Build + déploiement sur GitHub Pages |

---

## Variables d'environnement client

Copier `.env.example` → `.env.local` pour le dev local :

```bash
cp client/.env.example client/.env.local
```

| Variable | Dev | Production |
|---|---|---|
| `VITE_SERVER_URL` | _(vide, utilise le proxy Vite)_ | URL du serveur déployé |
| `VITE_BASE_URL` | `/` | `/prend-ton-temps` |

