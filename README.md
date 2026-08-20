# PRO.DE.L.I SARLU — site institutionnel

Site vitrine statique et bilingue de **PROGENITURE DENIS LOMEA IFANGWA SARLU**,
en sigle **PRO.DE.L.I SARLU**, pour le domaine `https://prodeli-sarlu.cc.cd/`.

Aucune dépendance applicative, aucun script tiers, aucun cookie, aucune base de
données. Trois fichiers JavaScript, une feuille de style, deux images SVG.

## La source de vérité

Le contenu institutionnel — dénomination, siège, objet social, capital, gérance,
durée, exercice — **n'est pas rédigé librement : il est repris des statuts**
(avril 2026, Acte uniforme OHADA). Chaque valeur est gardée par un test.

| ce qui est publié | article des statuts |
|---|---|
| dénomination et sigle | article 2 |
| siège social | article 3 |
| objet social (6 domaines) | article 4 |
| durée — 99 ans | article 5 |
| capital — 1 500 USD, 100 parts de 15 USD | articles 6 et 7 |
| gérance — LOMELA IFANGWA Medy | article 14 |
| exercice social — 1er janvier au 31 décembre | article 19 |
| juridiction — Kinshasa | article 27 |

Le préambule des statuts fournit la conviction affichée en page d'accueil et les
deux listes « ce que la société rejette / promeut ». **Rien n'a été inventé** :
ni date de création, ni effectif, ni client, ni chiffre.

### Deux écarts constatés, non corrigés

1. **`LOMEA` / `LOMELA`.** L'article 2 fixe la dénomination à « PROGENITURE
   DENIS **LOMEA** IFANGWA SARLU ». Partout ailleurs dans les statuts — et sur
   le cachet officiel — le nom est **LOMELA**. Le site publie l'article 2 tel
   quel, car c'est lui qui fait foi. L'écart appartient à l'acte constitutif,
   pas au site.
2. **Le cachet et l'article 2** ne portent donc pas la même orthographe. À
   arbitrer avec le greffe, pas ici.

## Contenu

Page unique : accueil · conviction et principes · objet social · projet
SchoolSafe · coopérations · contact · mentions légales. Plus une page 404.

Français et anglais côté client, à parité stricte (110 clés de chaque côté).
La langue suit `?lang=`, puis le choix mémorisé, puis celle du navigateur.

## Développement

```bash
python3 -m http.server 8080   # ou : npm start
```

## Tests

```bash
npm test
```

Onze tests, sans aucune dépendance (`node --test`). Ils vérifient :

- que la dénomination, le siège, la gérance, le capital, le RCCM et l'ID
  national publiés sont bien ceux des statuts ;
- que le téléphone est au format international et que l'e-mail est le bon ;
- la parité FR/EN, l'absence de clé vide, de clé employée sans traduction et de
  traduction jamais employée ;
- que le bouton SchoolSafe n'est pas dupliqué ;
- que le `mailto` code les espaces en `%20` et non en `+` ;
- que la page 404 emploie des chemins absolus ;
- que toutes les ressources référencées existent ;
- **qu'aucune donnée sensible n'a atterri dans le dépôt** — le test cherche une
  forme (toute suite de onze chiffres ou plus, hors téléphone public), jamais
  une valeur, afin de ne pas écrire lui-même ce qu'il interdit.

Les tests ont été éprouvés dans les deux sens : quatre défauts réinjectés
volontairement sont chacun rattrapés par le test correspondant.

## Le cachet

`assets/img/seal.svg` est le cachet officiel **redessiné en SVG** : net à toute
taille, fond transparent, aucun fichier lourd. Deux différences assumées avec
l'original : le texte du bas se lit à l'endroit plutôt qu'inversé, et la
disposition des flèches est simplifiée. Pour une fidélité au pixel près, il
faudrait le fichier vectoriel d'origine.

`assets/img/mark.svg` en est l'emblème seul, pour les petites tailles et l'icône
d'onglet.

## Déploiement

La racine est publiable telle quelle sur GitHub Pages ou Cloudflare Pages. Le
`CNAME` pointe sur `prodeli-sarlu.cc.cd`.

**Aucun mot de passe, jeton, code ou secret ne doit être ajouté à ce dépôt.**
