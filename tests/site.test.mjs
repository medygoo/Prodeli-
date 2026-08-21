import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { translations, supportedLanguages } from '../assets/js/i18n.js';
import { buildMailto } from '../assets/js/contact.js';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const lire = (f) => readFileSync(join(racine, f), 'utf8');
const html = lire('index.html');
const html404 = lire('404.html');

/* Un contrôle qui ne couvre qu'un fichier ne protège que ce fichier.
   Toute page HTML du site entre ici — sinon la suivante arrivera chez le
   visiteur sans qu'un seul test l'ait regardée. */
const PAGES = ['index.html', '404.html', 'schoolsafe/index.html'];
const pages = Object.fromEntries(PAGES.map((f) => [f, lire(f)]));

/* ── Ce que les statuts et le RCCM fixent ─────────────────────────────
   Ces valeurs ne se déduisent pas : elles viennent de l'acte constitutif.
   Un test qui les garde empêche qu'une reprise de style les efface.      */
const STATUTS = {
  denomination: 'PROGENITURE DENIS LOMEA IFANGWA SARLU', // article 2
  sigle: 'PRO.DE.L.I SARLU',                             // article 2
  siege: 'Avenue Kambabare n°4367, Quartier Ndolo, Commune de Barumbu', // adresse fixee par Loms
  gerant: 'LOMELA IFANGWA Medy',                         // article 14
  capital: '1 500 USD',                                  // article 6
  rccm: 'CD/KNM/RCCM/26-B-00585',
  idnat: '01-08401-N00001S'
};
const TELEPHONE = '+243828432689';
const COURRIEL = 'contact@prodeli-sarlu.cc.cd';

test('la dénomination de l’article 2 est publiée telle quelle', () => {
  assert.ok(html.includes(STATUTS.denomination), 'dénomination absente ou modifiée');
  assert.ok(html.includes(STATUTS.sigle), 'sigle absent');
});



test('l’adresse publiée est celle fixée par Loms, et il n’y en a qu’une', () => {
  /* Une seule adresse : Avenue Kambabare n°4367, Quartier Ndolo, Barumbu.
     Décision de Loms, confirmée trois fois. */
  assert.ok(html.includes('Avenue Kambabare n°4367'), 'adresse absente');
  assert.ok(!html.includes('Ngungu'), 'une seconde adresse a reparu');
  for (const langue of ['fr', 'en']) {
    assert.ok(/Kambabare/.test(translations[langue]['legal.seat']), `${langue} : adresse absente des mentions légales`);
    assert.ok(/Kambabare/.test(translations[langue]['contact.address']), `${langue} : adresse absente du contact`);
  }
});

test('le gérant, le RCCM et l’ID national sont présents', () => {
  for (const valeur of [STATUTS.gerant, STATUTS.rccm, STATUTS.idnat]) {
    assert.ok(html.includes(valeur), `absent de la page : ${valeur}`);
  }
});

test('la page ne dévoile RIEN de ce qui ne la regarde pas', () => {
  /* Décision de Loms : le bas de page en disait trop. Le capital surtout —
     un partenaire en tire une conclusion sur la taille de la société avant
     d'avoir lu ce qu'elle fait, et aucune loi n'oblige à le publier.
     Ce test garde le retrait : il échoue si l'un d'eux revient. */
  const interdits = [
    ['1 500 USD', 'le capital social'],
    ['1,500', 'le capital social'],
    ['100 parts', 'la répartition des parts'],
    ['associé unique', 'la structure de propriété'],
    ['sole shareholder', 'la structure de propriété'],
    ['sans base de données', 'le détail technique du site'],
    ['no database', 'le détail technique du site'],
    ['99 ans', 'la durée statutaire'],
    ['Baobab', 'la banque'],
    ['2111', 'le compte bancaire']
  ];
  for (const [motif, quoi] of interdits) {
    assert.ok(!html.includes(motif), `${quoi} est publié : « ${motif} »`);
  }
  for (const langue of ['fr', 'en']) {
    const tout = Object.values(translations[langue]).join(' ');
    for (const [motif, quoi] of interdits) {
      assert.ok(!tout.includes(motif), `${langue} : ${quoi} est dans le catalogue : « ${motif} »`);
    }
  }
});

test('les coordonnées publiques sont exactes et internationales', () => {
  assert.ok(html.includes(`tel:${TELEPHONE}`), 'le téléphone doit être au format international');
  assert.ok(!/tel:0\d/.test(html), 'un numéro local ne peut pas être appelé de l’étranger');
  assert.ok(html.includes(`mailto:${COURRIEL}`));
});

test('parité FR / EN : mêmes clés, aucune vide', () => {
  const fr = Object.keys(translations.fr);
  const en = Object.keys(translations.en);
  assert.deepEqual(fr.filter((k) => !en.includes(k)), [], 'clés absentes de l’anglais');
  assert.deepEqual(en.filter((k) => !fr.includes(k)), [], 'clés absentes du français');
  for (const langue of supportedLanguages) {
    for (const [cle, valeur] of Object.entries(translations[langue])) {
      assert.ok(valeur && valeur.trim().length > 0, `${langue}.${cle} est vide`);
    }
  }
});

test('toute clé employée dans une page existe, et aucune ne dort', () => {
  const employees = new Map();
  for (const [fichier, source] of Object.entries(pages)) {
    for (const m of source.matchAll(/data-i18n(?:-doc|-alt|-label)?="([^"]+)"/g)) {
      employees.set(m[1], fichier);
    }
  }
  const catalogue = new Set(Object.keys(translations.fr));
  for (const [cle, fichier] of employees) {
    assert.ok(catalogue.has(cle), `clé employée dans ${fichier} et absente du catalogue : ${cle}`);
  }
  for (const cle of catalogue) {
    assert.ok(employees.has(cle), `clé du catalogue employée par aucune page : ${cle}`);
  }
});

test('le lien SchoolSafe n’apparaît qu’une seule fois', () => {
  const liens = html.match(/schoolsafe1\.cc\.cd/g) || [];
  assert.equal(liens.length, 1, 'le bouton SchoolSafe a été dupliqué');
  const js = lire('assets/js/main.js').split('\n').filter((l) => !l.trim().startsWith('*') && !l.trim().startsWith('/*'));
  assert.ok(!js.join('\n').includes('createElement'), 'aucun script ne doit re-créer ce bouton');
});

test('le mailto n’envoie pas des « + » à la place des espaces', () => {
  const url = buildMailto({ name: 'Jean Dupont', email: 'jean@exemple.cd', subject: 'Objet test', message: 'Deux mots' });
  const requete = url.split('?')[1];
  assert.ok(!requete.includes('+'), 'un client mail afficherait ces + tels quels');
  assert.ok(requete.includes('%20'), 'les espaces doivent être codés en %20');
  assert.ok(url.startsWith(`mailto:${COURRIEL}?`));
});

test('la page 404 tient depuis n’importe quelle profondeur d’URL', () => {
  for (const attribut of ['href="/assets/css/styles.css"', 'src="/assets/img/cachet-prodeli.svg"']) {
    assert.ok(html404.includes(attribut), `chemin relatif dans 404.html : ${attribut}`);
  }
  assert.ok(!/(?:href|src)="assets\//.test(html404), 'chemin relatif restant dans 404.html');
});

test('toutes les ressources référencées existent', () => {
  const refs = new Set();
  for (const page of Object.values(pages)) {
    for (const m of page.matchAll(/(?:href|src)="(\/assets\/[^"]+)"/g)) refs.add(m[1]);
  }
  assert.ok(refs.size >= 4, 'aucune ressource détectée — le test ne vérifie rien');
  for (const ref of refs) assert.ok(existsSync(join(racine, ref)), `ressource introuvable : ${ref}`);
});

test('aucune donnée sensible n’a atterri dans le dépôt', () => {
  /* Les statuts contiennent un numéro de pièce d'identité et un numéro de
     compte bancaire. Ils ne sont écrits nulle part ici — y compris dans ce
     test, qui cherche une FORME, pas une valeur : toute suite de 11 chiffres
     ou plus, hormis le téléphone public. */
  const autorise = TELEPHONE.replace('+', '');
  const fichiers = [];
  (function parcourir(dossier) {
    for (const nom of readdirSync(dossier)) {
      if (nom === '.git' || nom === 'node_modules') continue;
      const chemin = join(dossier, nom);
      if (statSync(chemin).isDirectory()) parcourir(chemin);
      else if (/\.(html|js|mjs|css|json|md|xml|txt|svg)$/.test(nom)) fichiers.push(chemin);
    }
  })(racine);

  for (const chemin of fichiers) {
    const contenu = readFileSync(chemin, 'utf8').split(autorise).join('');
    const suspect = contenu.match(/\d{11,}/);
    assert.equal(suspect, null, `suite de chiffres suspecte dans ${chemin.replace(racine, '.')} : ${suspect}`);
    assert.ok(!/BEGIN [A-Z ]*PRIVATE KEY|api[_-]?key\s*[:=]/i.test(contenu), `secret possible dans ${chemin}`);
  }
});

test('l’histoire du fondateur porte son portrait et ses dates', () => {
  assert.ok(html.includes('assets/img/denis-lomela-ifangwa.jpg'), 'portrait absent');
  assert.ok(html.includes('datetime="1957-08-18"') && html.includes('datetime="2023-05-22"'),
    'les dates doivent être en <time datetime> pour être lisibles par une machine');
  for (const langue of ['fr', 'en']) {
    assert.ok(translations[langue]['lineage.portraitAlt'].includes('Lomela Ifangwa'),
      `${langue} : le portrait doit avoir une description alternative nommée`);
  }
});

test('chaque entité porte son propre emblème', () => {
  assert.ok(html.includes('/assets/img/fondation-mark.svg'), 'emblème de la Fondation absent');
  assert.ok(html.includes('/assets/img/embleme-prodeli.svg'), 'emblème de la société absent');
  /* Les deux emblèmes sont décoratifs : le nom est déjà le titre de la carte.
     Un alt vide est donc correct, un alt qui répète le titre serait du bruit
     pour un lecteur d'écran. */
  const cartes = html.split('class="card lignee"').slice(1);
  assert.equal(cartes.length, 2, 'il doit y avoir exactement deux cartes de lignée');
  for (const carte of cartes) {
    assert.ok(/<img class="lignee-logo"[^>]*alt=""/.test(carte), 'emblème décoratif sans alt vide');
  }
});

test('les cinq personnes de la lignée sont nommées, chacune avec sa citation', () => {
  const gens = ['Grégoire Ifangwa', 'Marie Lokwa', 'Marie Josée Bokungu Ifangwa',
                'Denis Lomela Ifangwa', 'Lomela Ifangwa Medy'];
  for (const nom of gens) assert.ok(html.includes(nom), `absent de la lignée : ${nom}`);
  for (const langue of ['fr', 'en']) {
    for (let i = 1; i <= 5; i += 1) {
      /* Un nom sans ce qu'il a transmis n'est qu'un trombinoscope : chaque
         entrée doit porter son rôle, sa citation et sa suite. */
      for (const suffixe of ['Role', 'Quote', 'Echo']) {
        const cle = `gen.${i}${suffixe}`;
        assert.ok(translations[langue][cle], `${langue} : ${cle} manquant`);
      }
    }
  }
});

test('les marques sont vectorielles, donc nettes à toute taille', () => {
  /* Un logo en JPG se pixellise dès qu'on l'agrandit — sur une bannière,
     un document imprimé, un écran dense. Les deux marques sont vectorielles. */
  for (const f of ['embleme-prodeli.svg', 'cachet-prodeli.svg']) {
    const svg = readFileSync(join(racine, 'assets/img', f), 'utf8');
    assert.ok(svg.startsWith('<svg'), `${f} n'est pas un SVG`);
    assert.ok(/viewBox="0 0 \d+ \d+"/.test(svg), `${f} n'a pas de viewBox : il ne se redimensionnera pas`);
    assert.ok(/fill="#[0-9a-f]{6}"/i.test(svg), `${f} n'a aucune couleur`);
  }
  /* Deux rasters seulement, et chacun pour une raison qui ne peut pas
     etre vectorisee : un PORTRAIT, et un RENDU EN RELIEF avec ses
     ombres et sa lumiere. Tout le reste doit rester vectoriel — le
     test echoue si un troisieme apparait. */
  const RASTERS_ADMIS = [
    'denis-lomela-ifangwa.jpg', 'marque-relief.jpg',
    /* Trois PLACEHOLDERS provisoires (photos de bureau, en attendant
       les vraies). Une photographie ne se vectorise pas davantage
       qu'un portrait — la raison est la même. */
    'bureau/accueil-placeholder.jpg', 'bureau/direction-placeholder.jpg', 'bureau/bureau-placeholder.jpg',
  ];
  let reste = html;
  for (const admis of RASTERS_ADMIS) reste = reste.split(admis).join('');
  assert.ok(!/\.jpg"/.test(reste), 'une marque en JPG subsiste dans la page');
  for (const admis of RASTERS_ADMIS) {
    assert.ok(html.includes(admis), `raster declare admis mais absent : ${admis}`);
    assert.ok(existsSync(join(racine, 'assets/img', admis)), `fichier absent : ${admis}`);
  }
  /* Le rendu en relief est LOURD : il doit etre servi en WebP d'abord. */
  assert.ok(/<source srcset="\/assets\/img\/marque-relief\.webp" type="image\/webp">/.test(html),
    'le rendu en relief doit avoir sa variante WebP en premier');
});

/* ══ La page SchoolSafe ═══════════════════════════════════════════════
   Elle est le projet que la société met en avant. Ce qui la tient debout
   se vérifie ici, pas à l'œil sur le site publié.                       */

test('la page SchoolSafe existe et se rattache au site', () => {
  const ss = pages['schoolsafe/index.html'];
  assert.ok(ss.includes('href="/assets/css/styles.css"'), 'la page n’emprunte pas la feuille du site');
  assert.ok(ss.includes('src="/assets/js/main.js"'), 'sans main.js, ni traduction ni menu');
  assert.ok(ss.includes('<link rel="canonical" href="https://prodeli-sarlu.cc.cd/schoolsafe/">'),
    'canonique absente : deux adresses pour une seule page');
  assert.ok(lire('sitemap.xml').includes('/schoolsafe/'), 'la page n’est pas dans le sitemap');
});

test('les deux pages portent EXACTEMENT le même menu', () => {
  /* Deux menus qui divergent, c'est un visiteur qui perd une entrée en
     changeant de page — et personne ne s'en aperçoit avant lui. */
  const menu = (source) => {
    const bloc = source.match(/<nav class="primary-nav"[\s\S]*?<\/nav>/);
    assert.ok(bloc, 'barre de navigation introuvable');
    return [...bloc[0].matchAll(/<a href="([^"]+)"/g)].map((m) => m[1].replace(/^\/#/, '#'));
  };
  assert.deepEqual(menu(pages['schoolsafe/index.html']), menu(html),
    'les deux barres de navigation ne portent pas les mêmes destinations');
});

test('l’accueil mène à la page SchoolSafe, et l’application reste joignable', () => {
  assert.ok(html.includes('href="/schoolsafe/"'), 'aucun chemin de l’accueil vers la page SchoolSafe');
  const liens = html.match(/schoolsafe1\.cc\.cd/g) || [];
  assert.equal(liens.length, 1, 'le lien vers l’application a été dupliqué ou perdu');
});

test('la carte de partage est une image que WhatsApp sait rendre', () => {
  /* Un SVG en og:image ne s'affiche ni sur WhatsApp, ni sur Facebook, ni
     sur LinkedIn : le lien partagé part alors sans aucune image. */
  for (const [fichier, source] of Object.entries(pages)) {
    if (fichier === '404.html') continue;
    const og = source.match(/property="og:image" content="([^"]+)"/);
    assert.ok(og, `${fichier} : aucune image de partage`);
    assert.ok(og[1].endsWith('.png'), `${fichier} : og:image doit être un PNG, pas ${og[1].split('.').pop()}`);
    const local = og[1].replace('https://prodeli-sarlu.cc.cd', '');
    assert.ok(existsSync(join(racine, local)), `${fichier} : image de partage introuvable — ${local}`);
    assert.ok(source.includes('content="1200"') && source.includes('content="630"'),
      `${fichier} : les dimensions de l’image doivent être déclarées`);
  }
});

test('le logo SchoolSafe ne paraît que sur fond sombre', () => {
  /* Le mot « School » est écrit en BLANC dans ce logo : posé sur une
     section claire, la moitié du nom disparaît. Ce n'est pas une
     préférence d'ambiance, c'est une contrainte de l'image. */
  const css = lire('assets/css/styles.css');
  for (const [fichier, source] of Object.entries(pages)) {
    for (const m of source.matchAll(/<img[^>]*schoolsafe-logo\.png[^>]*>/g)) {
      const classe = (m[0].match(/class="([^"]*)"/) || [, ''])[1];
      assert.ok(/ss-logo|ss-marque/.test(classe),
        `${fichier} : le logo doit porter .ss-logo ou .ss-marque pour être placé — vu « ${classe} »`);
    }
  }
  /* .ss-logo vit dans .ss-hero, qui est une section-encre ; .ss-marque
     vit dans #projets, également section-encre. Les deux sections sont
     déclarées sombres dans la page, on le vérifie. */
  const ss = pages['schoolsafe/index.html'];
  assert.ok(/class="section section-encre ss-hero"/.test(ss), '.ss-hero n’est plus sur fond encre');
  assert.ok(/class="section section-encre" id="projets"/.test(html), '#projets n’est plus sur fond encre');
  assert.ok(css.includes('.section-encre{background:var(--encre)'), 'section-encre n’est plus sombre');
});

test('le vert WhatsApp porte son texte blanc — mesuré, pas estimé', () => {
  /* Le vert de marque #25D366 donne 1,98:1 sous du blanc : illisible.
     Agrandir le bouton n'y change rien, il faut assombrir le fond. */
  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const rapport = (a, b) => {
    const [x, y] = [lum(a), lum(b)];
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  assert.ok(rapport('#ffffff', '#25D366') < 4.5, 'le test ne mesure rien s’il valide le vert de marque');

  const css = lire('assets/css/styles.css');
  const fonds = new Set();
  for (const regle of css.match(/\.(?:button-wa|wa-flottant)[^{]*\{[^}]*\}/g) || []) {
    for (const m of regle.matchAll(/background:(#[0-9a-fA-F]{6})/g)) fonds.add(m[1]);
  }
  assert.ok(fonds.size >= 2, 'aucun fond WhatsApp trouvé — le test ne vérifie rien');
  for (const fond of fonds) {
    const r = rapport('#ffffff', fond);
    assert.ok(r >= 4.5, `blanc sur ${fond} : ${r.toFixed(2)}:1 — sous le seuil AA`);
  }
});

test('tout chemin interne mène à un fichier qui existe', () => {
  for (const [fichier, source] of Object.entries(pages)) {
    for (const m of source.matchAll(/href="(\/[^"#?]*)"/g)) {
      const cible = m[1];
      if (cible.startsWith('/assets/')) continue;
      const sur_disque = cible.endsWith('/') ? join(cible, 'index.html') : cible;
      assert.ok(existsSync(join(racine, sur_disque)),
        `${fichier} : lien mort vers ${cible}`);
    }
  }
});

test('chaque tracé SVG se parse — une icône cassée disparaît en silence', () => {
  /* Un « d » mal formé ne lève aucune erreur visible : le navigateur
     refuse le tracé entier et l'icône n'est simplement pas dessinée.
     C'est arrivé ici — un espace perdu avait collé « .5 0 » en « .50 »,
     et les deux boutons WhatsApp de l'accueil n'avaient plus d'icône.
     Le nombre de coordonnées de chaque commande le dit. */
  const ARITE = { M: 2, L: 2, T: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, A: 7, Z: 0 };
  const NOMBRE = /-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;

  let traces = 0;
  for (const [fichier, source] of Object.entries(pages)) {
    for (const m of source.matchAll(/<path[^>]*\sd="([^"]+)"/g)) {
      traces += 1;
      const d = m[1];
      /* on découpe sur les lettres de commande */
      const morceaux = d.split(/(?=[MmLlHhVvCcSsQqTtAaZz])/).filter((x) => x.trim());
      for (const morceau of morceaux) {
        const cmd = morceau[0];
        const arite = ARITE[cmd.toUpperCase()];
        assert.notEqual(arite, undefined, `${fichier} : commande inconnue « ${cmd} »`);
        const nombres = morceau.slice(1).match(NOMBRE) || [];
        /* le reste du morceau, une fois les nombres retirés, ne doit
           contenir que des séparateurs — sinon un caractère traîne */
        const reste = morceau.slice(1).replace(NOMBRE, '').replace(/[\s,]/g, '');
        assert.equal(reste, '', `${fichier} : caractère parasite dans « ${morceau.slice(0, 30)} »`);
        if (arite === 0) {
          assert.equal(nombres.length, 0, `${fichier} : « ${cmd} » ne prend aucune coordonnée`);
        } else {
          assert.equal(nombres.length % arite, 0,
            `${fichier} : « ${cmd} » attend un multiple de ${arite} coordonnées, ` +
            `il en reçoit ${nombres.length} — « ${morceau.slice(0, 40)}… »`);
        }
      }
    }
  }
  assert.ok(traces >= 20, `seulement ${traces} tracés inspectés — le test ne vérifie presque rien`);
});

test('agrandir le portrait marche AUSSI sans JavaScript', () => {
  /* Le declencheur doit etre un vrai lien vers le fichier image : sans
     script, il ouvre la photo en grand dans le navigateur. Un bouton qui
     ne ferait rien sans JavaScript serait un controle muet — la faute que
     ce projet traque partout ailleurs. */
  const lien = html.match(/<a class="lig-loupe"[\s\S]{0,900}?<\/a>/);
  assert.ok(lien, 'le portrait n’est pas agrandissable');
  const href = (lien[0].match(/href="([^"]+)"/) || [])[1];
  assert.ok(href, 'le declencheur n’a pas de href — il ne ferait rien sans script');
  assert.ok(existsSync(join(racine, href)), `le lien mene a un fichier absent : ${href}`);
  assert.ok(/<img[^>]*class="lig-photo"/.test(lien[0]), 'le lien ne contient pas la vignette');
  assert.ok(/aria-label="[^"]+"/.test(lien[0]), 'un lien dont le contenu est une image a besoin d’un intitule');

  /* La vue agrandie vit dans le HTML : rien n'est fabrique a l'execution. */
  assert.ok(/<div class="loupe" id="loupe"[^>]*hidden>/.test(html),
    'la vue agrandie doit exister dans la page, masquee');
  for (const marque of ['data-loupe-image', 'data-loupe-legende', 'data-loupe-fermer']) {
    assert.ok(html.includes(marque), `repere absent de la vue agrandie : ${marque}`);
  }
  const js = lire('assets/js/main.js');
  assert.ok(!js.includes('createElement'), 'la vue agrandie ne doit pas etre fabriquee en JavaScript');

  /* [hidden] doit vraiment cacher : .loupe est en display:flex, et une
     regle d'affichage l'emporte sur l'attribut si on ne la neutralise pas. */
  const css = lire('assets/css/styles.css');
  assert.ok(css.includes('.loupe[hidden]{display:none}'),
    'sans cette regle, la vue agrandie couvrirait la page en permanence');
});

test('aucune image ne porte un src VIDE', () => {
  /* `src=""` ne veut pas dire « pas de source » : il se resout en
     l'adresse de la PAGE. Le navigateur telecharge donc le HTML une
     seconde fois pour tenter de l'afficher comme une image, et echoue.
     Trouve sur la vue agrandie, ou le src etait rempli par le script. */
  for (const [fichier, source] of Object.entries(pages)) {
    assert.ok(!/<img[^>]*\ssrc=""/.test(source), `${fichier} : une image porte src=""`);
    assert.ok(!/<(?:script|img|source)[^>]*\ssrcset=""/.test(source), `${fichier} : srcset vide`);
  }
});
