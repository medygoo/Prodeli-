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
