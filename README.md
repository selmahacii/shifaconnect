# Shifa-Connect | الشفاء كونيكت

<div align="center">

![Shifa-Connect Logo](public/logo.svg)

**Plateforme de gestion de cabinet médical pour médecins privés algériens**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[演示 Demo](#-démonstration) • [ Fonctionnalités](#-fonctionnalités) • [Installation](#-installation) • [Déploiement](#-déploiement)

</div>

---

## 📋 Description

**Shifa-Connect** est une solution SaaS complète de gestion de cabinet médical, conçue spécifiquement pour les médecins généralistes et spécialistes privés en Algérie. L'application offre une interface bilingue (Français/Arabe) et respecte les spécificités du système de santé algérien.

### 🎯 Public cible

- Médecins généralistes
- Médecins spécialistes (pédiatres, cardiologues, dermatologues, etc.)
- Cabinets médicaux privés
- Cliniques privées

### 🌍 Particularités algériennes

- **Devise** : Dinar Algérien (DZD)
- **Format de date** : DD/MM/YYYY
- **Wilayas** : Les 48 wilayas d'Algérie
- **Carte Chifa** : Intégration du numéro de carte Chifa
- **NIN** : Numéro d'Identification Nationale
- **Bilinguisme** : Interface en français et arabe (RTL)

---

## ✨ Fonctionnalités

### 👤 Gestion des Patients
- Création et modification de dossiers patients
- Informations bilingues (français/arabe)
- Recherche avancée par nom, téléphone, numéro de dossier
- Historique médical complet
- Gestion des allergies et maladies chroniques
- Numéro de carte Chifa et NIN

### 🩺 Consultations
- Création rapide de consultations
- Signes vitaux (TA, température, pouls, poids, taille)
- Motif de consultation bilingue
- Diagnostic avec codes CIM-10
- Notes d'examen
- Plan de traitement
- Suivi des paiements

### 💊 Ordonnances
- Génération d'ordonnances professionnelles
- Médicaments avec posologie détaillée
- Instructions en français et arabe
- **Export PDF** avec en-tête personnalisé
- Tampon et signature numériques
- Historique des ordonnances

### 📅 Agenda / Rendez-vous
- Calendrier interactif
- Prise de rendez-vous rapide
- Gestion des créneaux horaires
- Durée de consultation configurable
- Rappels (fonctionnalité à venir)
- Vue journalière, hebdomadaire, mensuelle

### 📊 Tableau de bord
- Statistiques en temps réel
- Graphiques des consultations
- Répartition par diagnostic
- Derniers patients vus
- Actions rapides

### ⚙️ Paramètres
- Profil médecin complet
- Informations du cabinet
- Horaires d'ouverture
- Tarif de consultation
- **Tampon et signature** pour les PDF
- Gestion des abonnements (à venir)

---

## 🛠 Stack Technique

| Catégorie | Technologie |
|-----------|-------------|
| **Framework** | Next.js 16 (App Router) |
| **Langage** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Base de données** | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| **État** | Zustand + TanStack Query |
| **Formulaires** | React Hook Form + Zod |
| **Graphiques** | Recharts |
| **Calendrier** | React Big Calendar |
| **PDF** | @react-pdf/renderer |
| **Icônes** | Lucide React |
| **Notifications** | Sonner |

---

## 📦 Prérequis

- **Node.js** >= 20.0.0 ou **Bun** >= 1.0.0
- **npm**, **yarn**, **pnpm** ou **bun**
- Compte **Supabase** (pour la production)
- Compte **Vercel** (pour le déploiement)

---

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/shifa-connect.git
cd shifa-connect
```

### 2. Installer les dépendances

```bash
# Avec npm
npm install

# Avec bun (recommandé)
bun install
```

### 3. Configuration de l'environnement

```bash
# Copier le fichier d'exemple
cp .env.local.example .env.local
```

Éditez `.env.local` avec vos valeurs :

```env
# Base de données (SQLite pour le développement)
DATABASE_URL="file:./db/custom.db"

# Authentification
NEXTAUTH_SECRET="votre-secret-de-32-caracteres-minimum"
NEXTAUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
bun run db:generate

# Créer les tables
bun run db:push

# (Optionnel) Ouvrir Prisma Studio
bun run db:studio
```

### 5. Lancer le serveur de développement

```bash
bun run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Configuration Supabase (Production)

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre mot de passe de base de données

### 2. Exécuter le script SQL

Dans l'éditeur SQL de Supabase, exécutez le contenu de `prisma/schema.prisma` après l'avoir converti en SQL avec :

```bash
bunx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > supabase-init.sql
```

Ou utilisez Prisma directement :

```bash
# Générer une migration
bunx prisma migrate dev --name init

# Pousser vers Supabase (après configuration de DATABASE_URL)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" bunx prisma db push
```

### 3. Récupérer les clés API

Dans **Project Settings > API** :

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Mettre à jour `.env.local`

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🌐 Déploiement sur Vercel

### Méthode 1 : Via l'interface Vercel

1. **Connecter le repository**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "New Project"
   - Importez votre repository GitHub/GitLab/Bitbucket

2. **Configurer le projet**
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `bun run build`
   - Output Directory: `.next`

3. **Ajouter les variables d'environnement**
   
   Dans **Settings > Environment Variables**, ajoutez :

   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   NEXTAUTH_SECRET=votre-secret-production
   NEXTAUTH_URL=https://votre-domaine.vercel.app
   NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

4. **Déployer**
   - Cliquez sur "Deploy"
   - Attendez la fin du build

### Méthode 2 : Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

### Configuration du domaine personnalisé

1. Dans **Settings > Domains**
2. Ajoutez votre domaine (ex: `shifa-connect.dz`)
3. Configurez les DNS chez votre registrar

---

## 📁 Structure du projet

```
shifa-connect/
├── prisma/
│   └── schema.prisma        # Schéma de la base de données
├── public/
│   └── logo.svg             # Logo de l'application
├── src/
│   ├── app/
│   │   ├── (auth)/          # Pages d'authentification
│   │   ├── (dashboard)/     # Pages principales (protégées)
│   │   ├── api/             # Routes API
│   │   └── layout.tsx       # Layout racine
│   ├── components/
│   │   ├── ui/              # Composants shadcn/ui
│   │   ├── dashboard/       # Composants du tableau de bord
│   │   ├── patients/        # Composants patients
│   │   ├── consultations/   # Composants consultations
│   │   ├── prescriptions/   # Composants ordonnances
│   │   ├── agenda/          # Composants agenda
│   │   └── settings/        # Composants paramètres
│   ├── hooks/               # Hooks React personnalisés
│   ├── lib/
│   │   ├── db.ts            # Client Prisma
│   │   ├── utils/           # Utilitaires
│   │   └── validations/     # Schémas Zod
│   └── types/               # Types TypeScript
├── .env.local.example       # Variables d'environnement exemple
├── vercel.json              # Configuration Vercel
├── package.json             # Dépendances
└── README.md                # Documentation
```

---

## 🎨 Système de design

### Couleurs

| Nom | Hex | Usage |
|-----|-----|-------|
| Primary | `#1B4F72` | Bleu médical profond |
| Secondary | `#148F77` | Vert sarcelle |
| Accent | `#F39C12` | Ambre (alertes) |
| Success | `#27AE60` | Succès |
| Danger | `#E74C3C` | Erreur/Danger |

### Typographie

- **Principale** : Inter (sans-serif)
- **Arabe** : Noto Sans Arabic

---

## 🔐 Sécurité

- Authentification par session avec NextAuth.js
- Hashage des mots de passe avec bcrypt
- Validation des entrées avec Zod
- Protection CSRF intégrée
- Headers de sécurité configurés

---

## 📈 Roadmap

### ✅ Version 1.0 (Actuelle)

- [x] Gestion des patients
- [x] Consultations
- [x] Ordonnances avec PDF
- [x] Agenda/Rendez-vous
- [x] Tableau de bord
- [x] Paramètres médecin
- [x] Support bilingue (FR/AR)

### 🚀 Version 2.0 (Planifiée)

- [ ] Rappels SMS pour les rendez-vous
- [ ] Certificats médicaux
- [ ] Lettres de référencement
- [ ] Gestion des documents médicaux
- [ ] Statistiques avancées
- [ ] Export des données

### 🔮 Version 3.0 (Future)

- [ ] Multi-utilisateurs (cliniques)
- [ ] Application mobile
- [ ] Intégration Chifa avancée
- [ ] Paiement en ligne
- [ ] Télémédecine

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez lire les guidelines de contribution avant de soumettre une PR.

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Support

- **Email** : support@shifa-connect.dz
- **Documentation** : [docs.shifa-connect.dz](https://docs.shifa-connect.dz)
- **Issues** : [GitHub Issues](https://github.com/votre-repo/shifa-connect/issues)

---

<div align="center">

**Fait avec ❤️ pour les médecins algériens**

**صنع بكل ❤️ للأطباء الجزائريين**

</div>
