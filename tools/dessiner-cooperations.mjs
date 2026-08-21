import { writeFileSync } from 'node:fs';

/* Meme vocabulaire que les six domaines : meme cadre, meme trait, meme
   palette. Deux familles d'images differentes sur une meme page donnent
   l'impression d'assemble — la lecon est deja ecrite pour les icones. */
const VERT='#0A7A45', FONCE='#065C33', PALE='#EAF4EE', PALE2='#DCEBE2',
      ROUGE='#C6372D', OR='#C09018';

const cadre = (id, corps) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" role="img" aria-hidden="true">
  <defs><clipPath id="k${id}"><rect width="400" height="120" rx="10"/></clipPath></defs>
  <g clip-path="url(#k${id})">
    <rect width="400" height="120" fill="${PALE}"/>
    <path d="M0 96 Q100 74 200 88 T400 78 V120 H0Z" fill="${PALE2}"/>
${corps}
  </g>
</svg>`;
const T=(d,o={})=>`    <path d="${d}" fill="none" stroke="${o.s||FONCE}" stroke-width="${o.w||2.4}" stroke-linecap="round" stroke-linejoin="round"${o.a?` opacity="${o.a}"`:''}/>`;
const R=(x,y,w,h,o={})=>`    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r??2}" fill="${o.f||'none'}"${o.f?'':` stroke="${o.s||FONCE}" stroke-width="${o.w||2.4}"`}/>`;
const C=(cx,cy,r,o={})=>`    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.f||'none'}"${o.f?'':` stroke="${o.s||FONCE}" stroke-width="${o.w||2.4}"`}/>`;

/* 01 — Investir avec nous : une main ouverte, une pousse, des pieces */
const investir = [
  T('M150 92c-8-6-12-14-12-24 0-4 4-6 7-3l7 7V44c0-4 6-4 6 0v22', { s: FONCE }),
  T('M158 66V38c0-4 6-4 6 0v28M164 66V44c0-4 6-4 6 0v24M170 70V52c0-4 6-4 6 0v20c0 12-6 20-16 24', { s: FONCE }),
  T('M226 92V58', { s: VERT }),
  T('M226 58c0-11 9-20 20-20 0 11-9 20-20 20z', { s: VERT }),
  T('M226 68c0-10-8-18-18-18 0 10 8 18 18 18z', { s: VERT }),
  C(272, 88, 8, { f: OR }), C(272, 76, 8, { f: OR }), C(272, 64, 8, { f: OR }),
  C(272, 88, 8, { s: FONCE, w: 1.8 }), C(272, 76, 8, { s: FONCE, w: 1.8 }), C(272, 64, 8, { s: FONCE, w: 1.8 }),
  T('M120 100h164', { w: 2.6, a: .35 })
].join('\n');

/* 02 — Nous confier un projet : un plan remis, et valide */
const confier = [
  R(146, 34, 62, 62, { s: FONCE, r: 4 }),
  T('M158 50h38M158 62h38M158 74h24', { w: 2 }),
  T('M208 46h34a8 8 0 0 1 8 8v42', { s: VERT, w: 2.2, a: .5 }),
  C(250, 70, 22, { s: VERT, w: 3 }),
  T('M240 70l7 7 14-15', { s: VERT, w: 3.2 }),
  T('M116 100h168', { w: 2.6, a: .35 })
].join('\n');

/* 03 — Nous representer : un globe, un jalon, une portee */
const representer = [
  C(168, 60, 28, { s: VERT, w: 3 }),
  T('M140 60h56M168 32c10 11 10 45 0 56M168 32c-10 11-10 45 0 56', { s: VERT, w: 2 }),
  T('M246 92c0-10 12-14 12-26a12 12 0 1 0-24 0c0 12 12 16 12 26z', { s: FONCE }),
  C(246, 66, 5, { f: OR }),
  T('M204 46h26M204 56h18', { s: FONCE, w: 2, a: .4 }),
  T('M270 52h22M276 62h16', { s: FONCE, w: 2, a: .4 }),
  T('M132 100h152', { w: 2.6, a: .35 })
].join('\n');

let n = 0;
for (const [nom, corps] of Object.entries({ investir, confier, representer })) {
  n += 1;
  const svg = cadre(n, corps);
  writeFileSync(`/workspace/prodeli-/assets/img/cooperations/${nom}.svg`, svg);
  console.log(nom.padEnd(14), (svg.length / 1024).toFixed(1) + ' Ko');
}
