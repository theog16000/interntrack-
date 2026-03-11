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
```
src/
├── app/
│   ├── (auth)/
│   │   ├── actions.ts          # Logique auth (signIn, signUp, signOut)
│   │   ├── login/page.tsx      # Page connexion
│   │   └── register/page.tsx   # Page inscription
│   ├── api/
│   │   ├── applications/       # CRUD candidatures
│   │   ├── companies/          # CRUD entreprises
│   │   ├── documents/          # Upload / téléchargement documents
│   │   └── interviews/         # CRUD entretiens
│   └── dashboard/
│       ├── layout.tsx          # Layout avec sidebar
│       ├── page.tsx            # Dashboard (stats + graphiques)
│       ├── applications/       # Kanban + vue liste
│       ├── companies/          # Répertoire entreprises
│       ├── documents/          # Mes documents
│       ├── interviews/         # Entretiens
│       └── settings/           # Paramètres
├── components/
│   ├── ApplicationCard.tsx     # Carte candidature
│   ├── ApplicationForm.tsx     # Formulaire candidature
│   ├── DocumentManager.tsx     # Gestion documents
│   └── Sidebar.tsx             # Navigation
└── lib/
    ├── types.ts                # Types TypeScript
    └── supabase/
        ├── client.ts           # Client navigateur
        └── server.ts           # Client serveur
```

## Installation

### Prérequis

- Node.js 18+
- Un compte [Supabase](https://supabase.com)
- Un compte [Vercel](https://vercel.com) (pour le déploiement)

### 1. Cloner le repo
```bash
git clone https://github.com/TON_USERNAME/interntrack.git
cd interntrack
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement

Crée un fichier `.env.local` à la racine :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ta_clé_anon
```

### 4. Configurer la base de données

Dans le SQL Editor de Supabase, exécute les scripts suivants dans l'ordre :

**Tables :**
```sql
-- Candidatures
create table applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company_name text not null,
  job_title text not null,
  offer_url text,
  hr_contact text,
  notes text,
  status text not null default 'to_apply'
    check (status in ('to_apply', 'sent', 'interview', 'offer', 'rejected')),
  applied_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Entreprises
create table companies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  sector text,
  website text,
  location text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Entretiens
create table interviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  application_id uuid references applications(id) on delete cascade not null,
  interview_date timestamptz not null,
  type text check (type in ('phone', 'video', 'onsite', 'technical', 'hr')) not null,
  notes text,
  status text check (status in ('scheduled', 'done', 'cancelled')) default 'scheduled',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents
create table documents (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references applications(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  file_path text not null,
  file_type text check (file_type in ('cv', 'cover_letter', 'other')),
  created_at timestamptz default now()
);
```

**Sécurité RLS :**
```sql
alter table applications enable row level security;
alter table companies enable row level security;
alter table interviews enable row level security;
alter table documents enable row level security;

create policy "Users manage own applications" on applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own companies" on companies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own interviews" on interviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own documents" on documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### 5. Lancer le serveur de développement
```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

## Déploiement

### Vercel

1. Pousse ton code sur GitHub
2. Importe le repo sur [vercel.com](https://vercel.com)
3. Ajoute les variables d'environnement dans **Settings → Environment Variables**
4. Clique **Deploy**

### Supabase

Dans **Authentication → URL Configuration** :
- Site URL : `https://ton-domaine.vercel.app`
- Redirect URLs : `https://ton-domaine.vercel.app/**`

## Roadmap

- [ ] Rappels automatiques (relance recruteur après 7/14 jours)
- [ ] Statistiques avancées (taux de réponse, graphiques)
- [ ] Extension navigateur (ajout depuis LinkedIn / Welcome to the Jungle)
- [ ] Mode sombre
- [ ] Suppression du compte (conformité RGPD)
- [ ] Authentification Google

## Licence

MIT