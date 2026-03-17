# 🏥 Shifa-Connect | الشفاء كونيكت

<div align="center">

![Shifa-Connect Logo](public/logo.svg)

**La plateforme "Mission Control" pour les médecins d'excellence en Algérie.**
*Gestion de cabinet médical moderne, bilingue et ultra-performante.*

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[Démonstration](#-démonstration) • [Fonctionnalités](#-fonctionnalités) • [Architecture](#-architecture) • [Installation](#-installation) • [Contribution](#-contribution)

</div>

---

## 📋 Aperçu

**Shifa-Connect** est une solution SaaS de pointe conçue pour révolutionner la gestion des cabinets médicaux privés en Algérie. Alliant une esthétique "Mission Control" à une robustesse technique, elle permet aux praticiens de se concentrer sur l'essentiel : **le soin patient.**

### 🌟 Points forts
- 🚀 **Performance Exceptionnelle** : Rendu hybride (SSR/ISR) avec Next.js 15.
- 🌍 **Localisation Totale** : Support bilingue (FR/AR), gestion des 58 Wilayas, NIN, et Carte Chifa.
- 🎨 **UI/UX Premium** : Interface dynamique, responsive et accessible, conçue pour un flux de travail sans friction.
- 🔐 **Sécurité de Données** : Scoping de données par médecin et protection robuste des dossiers médicaux.

---

## 🏗 Architecture du Système

```mermaid
graph TD
    subgraph Client
        UI["Browser/Mobile"] --> |"Next.js Client Components"| FE["React / Tailwind"]
    end

    subgraph Server
        FE --> |"API Routes / Server Actions"| BE["Next.js Server Side"]
        BE --> |"Prisma ORM"| DB[("PostgreSQL / SQLite")]
        BE --> |"NextAuth.js"| Auth["Authentication Layer"]
    end

    subgraph Services
        Auth --> |"Session Management"| Session["Prisma Session Store"]
        DB --> |"Cloud Storage"| Supa["Supabase Storage"]
    end

    style BE fill:#1B4F72,color:#fff
    style DB fill:#148F77,color:#fff
    style UI fill:#f39c12,color:#fff
```

---

## ✨ Fonctionnalités Clés

| Module | Description |
| :--- | :--- |
| **📈 Dashboard** | Statistiques en temps réel, graphiques de consultations et monitoring d'activité. |
| **👥 Patients** | Dossiers bilingues complets, antécédents, allergies et recherche intelligente. |
| **🩺 Consultations** | Prise de notes structurée, paramètres vitaux (TA, IMC, Temp) et diagnostics CIM-10. |
| **💊 Ordonnances** | Génération d'ordonnances professionnelles en PDF avec tampon numérique. |
| **📅 Agenda** | Gestion fluide des rendez-vous avec vues multiples et suivi des statuts. |

---

## 🛠 Stack Technique

### Core
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Langage**: [TypeScript](https://www.typescriptlang.org/)
- **Base de données**: [Prisma](https://www.prisma.io/) (PostgreSQL/SQLite)
- **Authentification**: [NextAuth.js](https://next-auth.js.org/) & [Supabase](https://supabase.com/)

### UI/UX
- **Style**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Composants**: [shadcn/ui](https://ui.shadcn.com/)
- **Icônes**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Outils
- **Formulaires**: React Hook Form + Zod
- **Graphiques**: Recharts
- **PDF**: @react-pdf/renderer

---

## 🚀 Installation Rapide

### 1. Prérequis
- Node.js 20+ ou Bun 1.1+
- Une instance PostgreSQL (ou SQLite par défaut)

### 2. Setup
```bash
# Cloner le dépôt
git clone https://github.com/votre-org/shifa-connect.git

# Installer les dépendances
bun install

# Configurer l'environnement
cp .env.local.example .env.local

# Initialiser la base de données
bunx prisma db push
bunx prisma db seed
```

### 3. Lancement
```bash
bun run dev
```

---

## 🤝 Contribution

Nous encourageons les contributions ! Que ce soit pour signaler un bug, proposer une fonctionnalité ou améliorer la documentation :

1.  **Fork** le projet.
2.  Créer une branche **Feature** (`git checkout -b feature/AmazingFeature`).
3.  **Commit** vos changements (`git commit -m 'Add AmazingFeature'`).
4.  **Push** sur la branche (`git push origin feature/AmazingFeature`).
5.  Ouvrir une **Pull Request**.

---

## 📄 Licence

Distribué sous la licence **MIT**. Voir `LICENSE` pour plus d'informations.

---

<div align="center">

**Conçu avec ❤️ pour moderniser la santé en Algérie.**
**صمم بكل ❤️ لتحديث قطاع الصحة في الجزائر**

[Documentation](https://docs.shifa-connect.dz) • [Signaler un bug](https://github.com/votre-org/shifa-connect/issues)

</div>
