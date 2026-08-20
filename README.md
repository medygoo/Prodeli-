# PRODELI S.A.R.L.U. — Site officiel

Site vitrine statique bilingue de PRODELI S.A.R.L.U., préparé pour le domaine `https://prodeli-sarlu.cc.cd/`.

## Contenu

- Accueil et positionnement institutionnel
- À propos / vision / valeurs
- Domaines d’intervention issus de l’objet social
- Projet SchoolSafe
- Partenariats
- Contact professionnel
- Mentions légales
- Français / anglais côté client
- SEO de base, `robots.txt`, `sitemap.xml`, page 404

## Développement local

Aucune dépendance applicative n’est requise.

```bash
python -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

## Tests

```bash
npm test
```

Les tests vérifient notamment les coordonnées publiques approuvées, la parité FR/EN, les liens de contact, les informations légales, les ressources du site et l’absence de données sensibles connues.

## Déploiement

Le dossier racine est directement publiable sur un hébergement statique tel que GitHub Pages ou Cloudflare Pages. Le domaine public attendu est `prodeli-sarlu.cc.cd`.

Configuration DNS et hébergeur à effectuer au moment de la publication. Aucun mot de passe, token, code OTP ou secret ne doit être ajouté à ce dépôt.
