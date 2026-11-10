# Mouam's Hairstyle

Site de réservation et espace administrateur de Mouam's Hairstyle, déployé avec Vinext, Vite et Cloudflare Workers.

## Développement local

Le projet utilise Node 22 ou une version plus récente :

```bash
nvm install 22
nvm use 22
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Le site est disponible sur `http://localhost:5173`.

## Configuration Cloudinary

1. Dans Cloudinary, récupérer le **Cloud name**, l’**API Key** et l’**API Secret**.
2. Mettre ces valeurs dans `.dev.vars` pour le développement local :

```text
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

3. Dans les variables d’environnement du projet Hiraiship, ajouter les trois mêmes variables comme secrets de production. `.dev.vars` et `.env.local` ne doivent jamais être poussés sur Git.
4. Ouvrir `/admin`, se connecter, puis ajouter une prestation et importer l’image. L’API signe l’upload côté serveur et range les images dans le dossier Cloudinary `mouams-hairstyle`.

Après une rotation de clés Cloudinary, mettre à jour les variables Hiraiship et `.dev.vars`.

## Connexion administrateur Supabase

Le formulaire `/admin` utilise Supabase Auth avec l’adresse e-mail et le mot de
passe du compte administrateur. Le mot de passe doit contenir au moins 8
caractères, une majuscule, une minuscule et un chiffre. Aucun symbole n’est
obligatoire.

Pour le build local, ajouter dans `.env.local` :

```text
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

Dans Supabase :

1. Dans **Authentication > Providers > Email**, laisser la confirmation d’adresse e-mail activée.
2. Dans **Authentication > Configuration**, définir la longueur minimale du mot de passe à 8 caractères.
3. Dans **Authentication > Users**, créer le compte de ta sœur et lui faire confirmer son adresse e-mail.
4. Ajouter son identifiant dans `public.profiles` avec `role = 'admin'`.

Dans Hiraiship, ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` comme variables de build, puis redéployer. La clé `service_role` ne doit jamais être ajoutée au navigateur ou au dépôt.

## Déploiement

```bash
npm run lint
npm run build
```

Le dossier de sortie Cloudflare est généré par Vinext. Le déploiement Hiraiship doit utiliser Node 22 et définir les trois secrets Cloudinary avant le build.

Le lien **Espace admin** est disponible dans le pied de page du site et pointe vers `/admin`.

## Limite actuelle des données

Les prestations, réservations, avis et disponibilités sont encore stockés dans le `localStorage` du navigateur. Les modifications faites dans l’admin sont donc visibles dans le même navigateur, mais ne constituent pas encore une base de données partagée entre appareils ou visiteurs. Cloudinary stocke les images, mais ne remplace pas cette persistance applicative.
