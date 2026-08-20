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

## La filiation — deux entités, une lignée

Le site porte désormais une section « Notre filiation », établie à partir des
**statuts notariés de la FONDATION PRODELI** (Office Notarial, Ministère de la
Justice et Garde des Sceaux) :

- **Fondation PRODELI** — association sans but lucratif fondée par **Denis
  Lomela Ifangwa**, le père. Objectif (article 3) : assistance, promotion et
  défense des droits inaliénables des peuples autochtones, paysans, veuves,
  orphelins et enfants abandonnés ; protection de l'environnement. Moyens
  (article 4) : microprojets exécutés par les membres et les nécessiteux
  eux-mêmes.
- **PRO.DE.L.I SARLU** — la société, constituée par **Lomela Ifangwa Medy**,
  le fils. « Progéniture de Denis Lomela Ifangwa » : la même conviction portée
  dans le champ de l'entreprise.

Le proverbe mongo cité en préface de la Fondation — **« LIMPUMPU JA NKOY,
BONENE W'EKOTO »**, « un jeune léopard, mais une grande fourrure » — est la
source directe de la conviction reprise au préambule des statuts de la société.
Il figure désormais sur le site.

Une note en bas de section rappelle que **les deux entités sont juridiquement
distinctes** et que la société n'exerce aucune activité sans but lucratif au
nom de la fondation.

### Ce que ces documents tranchent

La signature du père est **Denis LOMELA IFANGWA**. Le gérant de la société est
**LOMELA IFANGWA Medy**. Le `LOMEA` de l'article 2 des statuts de la SARLU est
donc une **faute de frappe dans l'acte**, et non une orthographe alternative.
Le site continue de publier l'article 2 tel quel — c'est lui qui fait foi — mais
l'écart est désormais documenté ici.

## Contenu

Page unique : accueil · conviction et principes · filiation · objet social ·
projet SchoolSafe · coopérations · contact · mentions légales. Plus une page 404.

Français et anglais côté client, à parité stricte (129 clés de chaque côté).
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

### Le logo de la Fondation

`assets/img/fondation-prodeli.svg` est le logo complet — losange vert, « DL »
pour Denis Lomela, et le mot-symbole « Fondation PRODELI ».
`assets/img/fondation-mark.svg` est le losange seul : c'est lui qui figure sur
la carte du site, parce que le nom y est déjà le titre et que le lockup complet
ferait doublon.

Vert relevé sur le logo fourni : **`#009028`**. Le blanc dessus donne **3,89:1** —
conforme uniquement en très grands caractères, ce qui est le cas du « DL ».
**Ce vert ne doit jamais porter de texte courant** ; la charte du site emploie
`#0A7A45` (5,41:1) pour cela.

## Déploiement

La racine est publiable telle quelle sur GitHub Pages ou Cloudflare Pages. Le
`CNAME` pointe sur `prodeli-sarlu.cc.cd`.

**Aucun mot de passe, jeton, code ou secret ne doit être ajouté à ce dépôt.**
