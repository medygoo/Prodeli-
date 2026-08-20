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

/* ── Ce que les statuts et le RCCM fixent ─────────────────────────────
   Ces valeurs ne se déduisent pas : elles viennent de l'acte constitutif.
   Un test qui les garde empêche qu'une reprise de style les efface.      */
const STATUTS = {
  denomination: 'PROGENITURE DENIS LOMEA IFANGWA SARLU', // article 2
  sigle: 'PRO.DE.L.I SARLU',                             // article 2
  siege: 'Avenue Ngungu n°108, Quartier Pende, Commune de Kinshasa', // article 3
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

test('le siège social publié est celui de l’article 3', () => {
  assert.ok(html.includes('Avenue Ngungu n°108'), 'le siège social ne correspond pas aux statuts');
  assert.ok(translations.fr['legal.seat'].includes('Ngungu'));
  assert.ok(translations.en['legal.seat'].includes('Ngungu'));
});

test('le bureau ne se confond jamais avec le siège social', () => {
  /* Deux adresses distinctes : celle qui fait foi (article 3) et celle où la
     société reçoit. Les confondre dans des mentions légales est une faute. */
  assert.ok(html.includes('Avenue Kambabare n°4367'), 'adresse du bureau absente');
  for (const langue of ['fr', 'en']) {
    const t = translations[langue];
    assert.ok(t['legal.office'].includes('Kambabare'), `${langue} : bureau absent`);
    assert.ok(t['legal.seat'].includes('Ngungu'), `${langue} : siège absent`);
    assert.notEqual(t['legal.office'], t['legal.seat'], `${langue} : les deux adresses sont identiques`);
    assert.ok(t['legal.seatNote'].length > 40, `${langue} : la distinction n'est pas expliquée`);
  }
});

test('la gérance, le capital, le RCCM et l’ID national sont présents', () => {
  for (const valeur of [STATUTS.gerant, STATUTS.rccm, STATUTS.idnat]) {
    assert.ok(html.includes(valeur), `absent de la page : ${valeur}`);
  }
  assert.ok(translations.fr['legal.capital'].includes(STATUTS.capital));
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

test('toute clé employée dans la page existe, et aucune ne dort', () => {
  const employees = new Set(
    [...html.matchAll(/data-i18n(?:-doc|-alt)?="([^"]+)"/g)].map((m) => m[1])
  );
  const catalogue = new Set(Object.keys(translations.fr));
  for (const cle of employees) assert.ok(catalogue.has(cle), `clé employée et absente du catalogue : ${cle}`);
  for (const cle of catalogue) assert.ok(employees.has(cle), `clé du catalogue jamais employée : ${cle}`);
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
  for (const attribut of ['href="/assets/css/styles.css"', 'src="/assets/img/seal.svg"']) {
    assert.ok(html404.includes(attribut), `chemin relatif dans 404.html : ${attribut}`);
  }
  assert.ok(!/(?:href|src)="assets\//.test(html404), 'chemin relatif restant dans 404.html');
});

test('toutes les ressources référencées existent', () => {
  const refs = new Set();
  for (const page of [html, html404]) {
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
  assert.ok(html.includes('/assets/img/mark.svg'), 'emblème de la société absent');
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
