import { writeFileSync } from 'node:fs';

/* Six illustrations pour les six domaines de l'article 4.
   Un seul vocabulaire : meme cadre 400x120, meme fond, meme trait.
   Six dessins qui se ressemblent forment un systeme ; six styles
   differents donnent l'impression d'assemble. */
const VERT = '#0A7A45', FONCE = '#065C33', PALE = '#EAF4EE', PALE2 = '#DCEBE2',
      ROUGE = '#C6372D', ENCRE = '#101813', OR = '#C09018';

const cadre = (id, corps) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" role="img" aria-hidden="true">
  <defs><clipPath id="c${id}"><rect width="400" height="120" rx="10"/></clipPath></defs>
  <g clip-path="url(#c${id})">
    <rect width="400" height="120" fill="${PALE}"/>
    <path d="M0 96 Q100 74 200 88 T400 78 V120 H0Z" fill="${PALE2}"/>
${corps}
  </g>
</svg>`;

const T = (d, o = {}) => `    <path d="${d}" fill="none" stroke="${o.s || FONCE}" stroke-width="${o.w || 2.4}" stroke-linecap="round" stroke-linejoin="round"${o.a ? ` opacity="${o.a}"` : ''}/>`;
const R = (x, y, w, h, o = {}) => `    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 2}" fill="${o.f || 'none'}"${o.f ? '' : ` stroke="${o.s || FONCE}" stroke-width="${o.w || 2.4}"`}${o.a ? ` opacity="${o.a}"` : ''}/>`;
const C = (cx, cy, r, o = {}) => `    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.f || 'none'}"${o.f ? '' : ` stroke="${o.s || FONCE}" stroke-width="${o.w || 2.4}"`}${o.a ? ` opacity="${o.a}"` : ''}/>`;

/* 1 — Participations, incubation & financement
   des barres qui montent, et une pousse qui sort de la derniere */
const un = [
  R(120, 74, 28, 26, { f: VERT, r: 3 }), R(160, 56, 28, 44, { f: VERT, r: 3 }),
  R(200, 36, 28, 64, { f: FONCE, r: 3 }),
  T('M262 100V62', { s: VERT }),
  T('M262 62c0-12 10-22 22-22 0 12-10 22-22 22z', { s: VERT }),
  T('M262 72c0-11-9-20-20-20 0 11 9 20 20 20z', { s: VERT }),
  C(304, 92, 8, { f: OR }), C(304, 80, 8, { f: OR }), C(304, 68, 8, { f: OR }),
  C(304, 92, 8, { s: FONCE, w: 1.8 }), C(304, 80, 8, { s: FONCE, w: 1.8 }),
  C(304, 68, 8, { s: FONCE, w: 1.8 }),
  T('M92 100h224', { w: 2.6 })
].join('\n');

/* 2 — Systemes circulaires, industriels & agricoles
   une boucle qui relie l'usine, le champ et la feuille */
const deux = [
  /* la boucle : deux arcs de 150 deg, chacun sa pointe */
  T('M158 34a44 44 0 0 1 84 14', { s: VERT, w: 3.2 }),
  T('M244 30l-2 20-19-6', { s: VERT, w: 3.2 }),
  T('M242 86a44 44 0 0 1-84-14', { s: VERT, w: 3.2 }),
  T('M156 90l2-20 19 6', { s: VERT, w: 3.2 }),
  /* l'usine, dans la boucle a gauche */
  T('M170 78V56l13 8v-8l13 8V44', { s: FONCE }),
  T('M164 78h38M176 70h4M189 70h4', {}),
  /* la feuille, dans la boucle a droite */
  T('M228 78c-11-6-13-20-4-30 11 4 16 17 10 28', { s: FONCE }),
  T('M224 78c1-9 3-17 8-23', { s: VERT, w: 2 }),
  T('M92 100h216', { w: 2.6, a: .35 })
].join('\n');

/* 3 — Direction, conseil & gestion
   un organigramme : une tete, trois relais, un document */
const trois = [
  R(178, 20, 44, 22, { f: FONCE, r: 4 }),
  T('M200 42v12M136 66v-12h128v12', { }),
  R(116, 66, 40, 20, { s: VERT }), R(180, 66, 40, 20, { s: VERT }), R(244, 66, 40, 20, { s: VERT }),
  T('M124 76h24M188 76h24M252 76h24', { s: VERT, w: 2 }),
  R(300, 44, 34, 44, { s: FONCE, r: 3 }),
  T('M308 56h18M308 66h18M308 76h11', { w: 2 })
].join('\n');

/* 4 — Intelligence artificielle & cybersecurite
   un bouclier, et un reseau de noeuds a l'interieur */
const quatre = [
  T('M200 18 158 32v30c0 24 17 41 42 50 25-9 42-26 42-50V32z', { s: FONCE, w: 3 }),
  T('M200 44v18M200 62l-18 12M200 62l18 12M182 74v14M218 74v14', { s: VERT, w: 2.2 }),
  C(200, 42, 6, { f: VERT }), C(182, 74, 5, { f: VERT }), C(218, 74, 5, { f: VERT }),
  C(200, 62, 5, { f: OR }), C(182, 90, 4.5, { f: FONCE }), C(218, 90, 4.5, { f: FONCE }),
  T('M96 40h34M96 52h22M270 40h34M282 52h22', { s: VERT, w: 2, a: .45 }),
  T('M104 74h20M276 74h20', { s: FONCE, w: 2, a: .3 })
].join('\n');

/* 5 — Formation, sante & infrastructures sociales
   une ecole, une croix de sante, deux silhouettes */
const cinq = [
  T('M148 96V56l34-18 34 18v40', { s: FONCE, w: 3 }),
  T('M182 38V26h14', {}),
  R(172, 70, 20, 26, { f: VERT, r: 2 }),
  T('M136 96h94', { w: 2.6 }),
  C(268, 56, 22, { s: ROUGE, w: 3 }),
  T('M268 46v20M258 56h20', { s: ROUGE, w: 3.4 }),
  C(112, 62, 8, { f: FONCE }), T('M100 96c0-10 5-18 12-18s12 8 12 18', { s: FONCE }),
  T('M100 100h204', { w: 2.6, a: .35 })
].join('\n');

/* 6 — Commerce & representation
   des caisses, un globe, et les deux sens de l'echange */
const six = [
  C(122, 62, 26, { s: VERT, w: 3 }),
  T('M96 62h52M122 36c9 10 9 42 0 52M122 36c-9 10-9 42 0 52', { s: VERT, w: 2 }),
  T('M188 38h100', { s: ROUGE, w: 3 }), T('M276 28l12 10-12 10', { s: ROUGE, w: 3 }),
  T('M304 62H204', { s: FONCE, w: 3 }), T('M216 52l-12 10 12 10', { s: FONCE, w: 3 }),
  R(196, 80, 26, 20, { s: FONCE }), R(230, 80, 26, 20, { s: FONCE }),
  R(264, 80, 26, 20, { s: FONCE }),
  T('M196 90h26M230 90h26M264 90h26', { w: 2 }),
  T('M92 100h216', { w: 2.6, a: .35 })
].join('\n');

const tout = { 'participations': un, 'circulaires': deux, 'direction': trois,
               'technologies': quatre, 'social': cinq, 'commerce': six };
let n = 0;
for (const [nom, corps] of Object.entries(tout)) {
  n += 1;
  const svg = cadre(n, corps);
  writeFileSync(`/workspace/prodeli-/assets/img/domaines/${nom}.svg`, svg);
  console.log(nom.padEnd(16), (svg.length / 1024).toFixed(1) + ' Ko');
}
