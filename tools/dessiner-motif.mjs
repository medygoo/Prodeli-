import { writeFileSync } from 'node:fs';

/* Le motif du site vient de l'embleme, pas d'ailleurs.
   L'embleme montre trois tours, un elan rouge, et une VOLEE DE FLECHES
   qui part vers le haut a droite. C'est cette volee qu'on reprend : elle
   dit ce que la societe dit d'elle-meme — on batit, et de la partent des
   projets.

   Une seule fleche est DECRITE ; les autres la reutilisent par <use>.
   Le fichier tient ainsi en quelques kilo-octets au lieu de trente. */

const W = 1200, H = 620;

/* Graine fixe : le motif doit etre le MEME a chaque generation, sinon il
   change en silence au prochain passage et personne ne sait pourquoi. */
let graine = 20260821;
const alea = () => { graine = (graine * 1103515245 + 12345) & 0x7fffffff; return graine / 0x7fffffff; };

const parts = [];
for (let i = 0; i < 130; i += 1) {
  const u = i / 129;
  const x = 40 + u * 1180 + (alea() - .5) * 150;
  const y = H - 40 - u * (H - 140) + (alea() - .5) * 190;
  const t = 0.55 + alea() * 0.85;
  const a = -32 + (alea() - .5) * 26;
  const o = 0.10 + (1 - u) * 0.16 + alea() * 0.06;
  if (y < 10 || y > H - 6) continue;
  parts.push(`<use href="#f" transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${a.toFixed(0)}) scale(${t.toFixed(2)})" opacity="${o.toFixed(2)}"/>`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<defs><path id="f" d="M-9 0H9M2.6-6.4 9 0l-6.4 6.4" fill="none" stroke="#0A7A45" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></defs>
${parts.join('')}
</svg>`;

writeFileSync('/workspace/prodeli-/assets/img/motif-envol.svg', svg);
console.log('motif-envol.svg ·', parts.length, 'fleches ·', (svg.length / 1024).toFixed(1) + ' Ko');
