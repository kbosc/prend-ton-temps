# 🕐 Prend Ton Temps

> 🎮 **Jouer en ligne** → [https://kbosc.github.io/prend-ton-temps/](https://kbosc.github.io/prend-ton-temps/)

---

## 🎲 Le jeu

**Prend Ton Temps** est un jeu de cartes coopératif multijoueur pour **exactement 4 joueurs**.

### Objectif

Travailler ensemble pour poser toutes vos cartes sur les 6 cadrans d'une horloge, en respectant deux règles fondamentales :

1. **Les sommes des cadrans doivent être croissantes** : la somme du cadran C1 doit être ≤ à C2, C2 ≤ C3, etc.
2. **Aucun cadran ne doit dépasser 24** (sauf si la condition spéciale *"Peut dépasser 24"* lui est attribuée).

### Déroulement d'une partie

1. **Lobby** : 4 joueurs rejoignent la salle. Chacun indique qu'il est prêt.
2. **Configuration** : le créateur de la salle choisit les conditions des cadrans (aléatoires ou personnalisées). Les autres joueurs voient les conditions en temps réel pour en discuter.
3. **Début** : une fois les conditions validées et la partie lancée, n'importe quel joueur peut cliquer **"Je commence"** pour prendre la main en premier.
4. **Tour par tour** : chaque joueur pose une carte de sa main sur le cadran de son choix, en glisser-déposer. La couleur de chaque carte posée est visible par tous, mais sa valeur reste secrète.
5. **Révélations** : au cours de la partie, les joueurs ont droit à **4 révélations** — ils peuvent retourner une carte posée pour en dévoiler la valeur à tous.
6. **Résolution** : quand toutes les cartes sont posées, on révèle tout et on vérifie si les conditions de victoire sont remplies.

### Distribution des cartes

- **24 cartes** au total : 12 blanches (valeurs 1–12) et 12 noires (valeurs 1–12).
- **3 cartes par joueur** sont distribuées aléatoirement.

### Conditions de victoire

- Toutes les cartes ont été posées.
- Chaque cadran contient au moins une carte.
- Les sommes sont dans l'ordre croissant ou égal (C1 ≤ C2 ≤ … ≤ C6).
- Chaque condition spéciale attribuée à un cadran est respectée.

### Conditions spéciales des cadrans

| Condition | Description |
|---|---|
| 🔢 Contient exactement N cartes | Le cadran doit avoir un nombre précis de cartes |
| 📈 Ordre strictement croissant | Les valeurs des cartes doivent augmenter |
| ⬛ Contient la plus grande carte noire | La carte noire de plus haute valeur doit y être |
| ⬜ Contient la plus petite carte blanche | La carte blanche de plus basse valeur doit y être |
| ♾️ Peut dépasser 24 | La limite de 24 ne s'applique pas à ce cadran |
| … | Et d'autres conditions personnalisables |

---

## 🏗️ Architecture & Choix techniques

### Structure du projet

```
prend-ton-temps/
├── client/   # Front-end React + Vite + Tailwind CSS
├── server/   # Back-end Node.js + Express + Socket.io
└── shared/   # Types TypeScript & logique métier partagés
```

Le projet est organisé en **monorepo npm workspaces** afin de partager les types et la logique métier (validation des victoires, pool de conditions) entre le client et le serveur sans duplication de code.

### Pourquoi ces technologies ?

| Technologie | Rôle | Raison du choix |
|---|---|---|
| **React 18** | Interface utilisateur | Écosystème riche, composants réutilisables, gestion d'état simple |
| **TypeScript** | Langage | Typage fort partagé entre client/serveur, détection d'erreurs à la compilation |
| **Vite** | Bundler client | Démarrage instantané en dev, build optimisé, support natif ESM |
| **Tailwind CSS** | Style | Utilitaire CSS rapide, cohérence visuelle, pas de CSS mort en prod |
| **Socket.io** | Temps réel | Gestion des WebSockets avec fallback HTTP, reconnexion automatique, rooms intégrées |
| **Express** | Serveur HTTP | Léger, flexible, compatible Socket.io |
| **Zustand** | État global client | Plus simple que Redux, API minimaliste, parfait pour un état de jeu |
| **Vitest** | Tests | Intégré à Vite, syntaxe Jest-compatible, rapide |
| **GitHub Pages** | Hébergement client | Gratuit, CI/CD intégré via GitHub Actions |
| **Render** | Hébergement serveur | Plan gratuit disponible, support Node.js + WebSocket, déploiement depuis GitHub |

### Pourquoi séparer `shared` ?

La logique de validation (règles de victoire, conditions des cadrans) est critique et doit être **identique** côté client et côté serveur. En la plaçant dans un package `@ptt/shared` partagé, on garantit que les deux côtés appliquent exactement les mêmes règles, sans risque de divergence.

---

## 🚀 Développement local

```bash
npm install
npm run dev
```

- **Client** : http://localhost:5173
- **Serveur** : http://localhost:3001

### Variables d'environnement

Copier `.env.example` → `.env.local` :

```bash
cp client/.env.example client/.env.local
```

| Variable | Dev | Production |
|---|---|---|
| `VITE_SERVER_URL` | *(vide, proxy Vite)* | `https://prend-ton-temps.onrender.com` |
| `VITE_BASE_URL` | `/` | `/prend-ton-temps` |

---

## 🧪 Tests

```bash
npm test                    # Tous les tests
npm run test --workspace=client   # Tests client
npm run test --workspace=server   # Tests serveur
npm run test --workspace=shared   # Tests shared
```

---

## 🌐 Déploiement en production

### Architecture de déploiement

```
GitHub ──push──► GitHub Actions ──build──► GitHub Pages  (client statique)
                                       └──► Render         (serveur Socket.io)
```

### Pipeline CI/CD

| Workflow | Déclencheur | Action |
|---|---|---|
| `ci.yml` | Push sur `main`/`develop` ou PR | Tests + build de vérification |
| `deploy.yml` | Push sur `main` uniquement | Build + déploiement sur GitHub Pages |

### Variables GitHub (Settings → Variables → Repository variables)

| Variable | Valeur |
|---|---|
| `VITE_SERVER_URL` | `https://prend-ton-temps.onrender.com` |
| `VITE_BASE_URL` | `/prend-ton-temps` |

### Variables Render (serveur)

| Variable | Valeur |
|---|---|
| `CLIENT_URL` | `https://kbosc.github.io` |
| `PORT` | `10000` *(défini automatiquement par Render)* |
