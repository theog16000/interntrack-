# InternTrack

Plateforme SaaS minimaliste pour centraliser et suivre ses candidatures de stage, de la veille à la signature de la convention.

## Aperçu

InternTrack permet aux étudiants de gérer leurs candidatures via un tableau Kanban intuitif, de suivre leurs entretiens, et d'organiser leurs documents (CV, lettres de motivation) en un seul endroit.

## Fonctionnalités

- **Authentification** — Inscription et connexion sécurisées
- **Tableau Kanban** — Gestion des candidatures par drag & drop (À postuler → Envoyé → Entretien → Offre → Refus)
- **Vue Liste** — Alternative au Kanban avec tri par entreprise, date d'ajout ou date de candidature
- **Fiches détaillées** — Entreprise, poste, lien de l'offre, contact RH, notes
- **Gestion des documents** — Upload et téléchargement de CV et lettres de motivation
- **Entreprises** — Répertoire des entreprises avec secteur, localisation et site web
- **Entretiens** — Suivi des entretiens planifiés
- **Dashboard** — Vue d'ensemble avec statistiques et graphiques

## Stack Technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 15+ (App Router) |
| Styling | Tailwind CSS |
| Icônes | Lucide React |
| Backend | Next.js API Routes |
| Base de données | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Stockage fichiers | Supabase Storage |
| Déploiement | Vercel |

## Structure du projet