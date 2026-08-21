import { initContactForm } from './contact.js';
import { normalizeLanguage, translations } from './i18n.js';

const STORAGE_KEY = 'prodeli-language';

/* Le bouton « Découvrir SchoolSafe » est écrit UNE fois, dans index.html.
   Une ancienne fonction l'ajoutait en JavaScript avec un garde-fou qui
   cherchait un attribut que le bouton du HTML ne portait pas : la page en
   affichait donc deux. Le bouton porte maintenant data-schoolsafe-link, et
   plus rien ne le duplique. */

export function translatePage(language) {
  const lang = normalizeLanguage(language);
  const catalog = translations[lang];
  const t = (key) => catalog[key];

  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const value = t(node.dataset.i18n);
    if (value) node.textContent = value;
  });

  /* Le titre et la description doivent suivre la langue : sinon un visiteur
     anglophone garde un onglet en français, et les moteurs indexent la page
     comme française. */
  document.querySelectorAll('[data-i18n-doc]').forEach((node) => {
    const value = t(node.dataset.i18nDoc);
    if (!value) return;
    if (node.tagName === 'TITLE') node.textContent = value;
    else node.setAttribute('content', value);
  });

  /* aria-label : un bouton dont le seul contenu est une icône n'a pas de
     texte à lire. Sans ça, la clé existerait dans le catalogue sans que
     personne ne l'applique — un champ mort. */
  document.querySelectorAll('[data-i18n-label]').forEach((node) => {
    const value = t(node.dataset.i18nLabel);
    if (value) node.setAttribute('aria-label', value);
  });

  document.querySelectorAll('[data-i18n-alt]').forEach((node) => {
    const value = t(node.dataset.i18nAlt);
    if (value) node.setAttribute('alt', value);
  });

  document.querySelectorAll('[data-lang]').forEach((button) => {
    const active = button.dataset.lang === lang;
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('is-active', active);
  });

  try { localStorage.setItem(STORAGE_KEY, lang); } catch (error) { /* navigation privée */ }
  return lang;
}

function langeDepart() {
  const demandee = new URLSearchParams(window.location.search).get('lang');
  if (demandee) return demandee;
  try {
    const enregistree = localStorage.getItem(STORAGE_KEY);
    if (enregistree) return enregistree;
  } catch (error) { /* navigation privée */ }
  return (navigator.language || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';
}

function initLanguage() {
  translatePage(langeDepart());
  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => translatePage(button.dataset.lang));
  });
}

function initNavigation() {
  const button = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-menu]');
  if (!button || !nav) return;

  const fermer = () => {
    button.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  };

  button.addEventListener('click', () => {
    const ouvert = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!ouvert));
    nav.classList.toggle('is-open', !ouvert);
  });

  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', fermer));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') fermer(); });
}

function initYear() {
  const node = document.querySelector('[data-year]');
  if (node) node.textContent = String(new Date().getFullYear());
}


/* ══════════════════════════════════════════════════════════════
   MOUVEMENT
   Le CSS ne cache rien tout seul : la classe .anim est posée ICI,
   et seulement si le navigateur sait observer le défilement. Si ce
   script ne tourne pas, la page reste entièrement visible — une
   animation ratée ne doit jamais effacer le contenu.
   ══════════════════════════════════════════════════════════════ */
function initMouvement() {
  if (!('IntersectionObserver' in window)) return;

  const racine = document.documentElement;
  racine.classList.add('anim');

  /* Ce qui se révèle au défilement. Les groupes sont décalés entre eux
     pour que l'œil suive un ordre, pas une apparition en bloc. */
  const groupes = [
    '.hero-grid > div > *', '.section-heading > *', '.proverbe',
    '.grid > .card', '.principe', '.objet-card', '.lignee-liste > .lig',
    '.projet > div > *', '.contact-grid > div > *', '.contact-form', '.legal-grid > div'
  ];
  groupes.forEach((selecteur) => {
    document.querySelectorAll(selecteur).forEach((noeud, rang) => {
      noeud.classList.add('rv');
      noeud.style.setProperty('--d', `${Math.min(rang, 6) * 70}ms`);
    });
  });

  const veilleur = new IntersectionObserver((entrees) => {
    entrees.forEach((entree) => {
      if (!entree.isIntersecting) return;
      entree.target.classList.add('vu');
      veilleur.unobserve(entree.target);   /* une fois révélé, on n'observe plus */
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

  document.querySelectorAll('.rv').forEach((noeud) => veilleur.observe(noeud));

  /* La lignée : le trait se trace, puis chaque personne s'allume à son tour. */
  const lignee = document.querySelector('.lignee-liste');
  if (lignee) {
    lignee.querySelectorAll('.lig-pt').forEach((point, rang) => {
      point.style.setProperty('--i', String(rang));
    });
    const veilleurLignee = new IntersectionObserver((entrees) => {
      entrees.forEach((entree) => {
        if (!entree.isIntersecting) return;
        entree.target.classList.add('vu');
        veilleurLignee.unobserve(entree.target);
      });
    }, { threshold: 0.12 });
    veilleurLignee.observe(lignee);
  }

  /* L'en-tête se décolle du haut : une ombre apparaît quand on a défilé. */
  const entete = document.querySelector('.site-header');
  if (entete) {
    let enCours = false;
    const majEntete = () => {
      entete.classList.toggle('detache', window.scrollY > 12);
      enCours = false;
    };
    window.addEventListener('scroll', () => {
      if (enCours) return;
      enCours = true;
      window.requestAnimationFrame(majEntete);
    }, { passive: true });
    majEntete();
  }
}

/* ══════════════════════════════════════════════════════════════
   LA LOUPE — agrandir le portrait
   Le declencheur est un VRAI LIEN vers le fichier image. Sans ce
   script, il ouvre la photo en grand dans le navigateur : le geste
   marche quand meme. Un controle qui ne ferait rien sans JavaScript
   serait un bouton muet, et c'est toujours un defaut.
   Rien n'est fabrique ici : la vue agrandie est ecrite dans le HTML.
   ══════════════════════════════════════════════════════════════ */
function initLoupe() {
  const loupe = document.querySelector('#loupe');
  const image = loupe && loupe.querySelector('[data-loupe-image]');
  const legende = loupe && loupe.querySelector('[data-loupe-legende]');
  const fermer = loupe && loupe.querySelector('[data-loupe-fermer]');
  const declencheurs = document.querySelectorAll('[data-agrandir]');
  if (!loupe || !image || !legende || !fermer || !declencheurs.length) return;

  let origine = null;   /* a qui rendre le focus en refermant */

  const ouvrir = (lien) => {
    const source = lien.querySelector('img');
    if (!source) return;
    origine = lien;
    image.src = source.currentSrc || source.src;
    image.alt = source.alt;
    legende.textContent = lien.dataset.legende || '';
    legende.hidden = !legende.textContent;
    loupe.hidden = false;
    document.body.classList.add('loupe-ouverte');
    /* le cadrage serre de la vignette ne vaut que pour la vignette */
    fermer.focus();
  };

  const refermer = () => {
    if (loupe.hidden) return;
    loupe.hidden = true;
    document.body.classList.remove('loupe-ouverte');
    if (origine) origine.focus();
    origine = null;
  };

  declencheurs.forEach((lien) => {
    lien.addEventListener('click', (evt) => {
      /* on laisse passer l'ouverture dans un nouvel onglet */
      if (evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.button !== 0) return;
      evt.preventDefault();
      ouvrir(lien);
    });
  });

  fermer.addEventListener('click', refermer);
  /* le fond referme, l'image non */
  loupe.addEventListener('click', (evt) => { if (evt.target === loupe) refermer(); });
  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') refermer();
    /* tant que la vue est ouverte, la tabulation ne sort pas du bouton */
    if (evt.key === 'Tab' && !loupe.hidden) { evt.preventDefault(); fermer.focus(); }
  });
}

/* ══════════════════════════════════════════════════════════════
   LE LISERE DE LECTURE ET LA PARALLAXE
   Deux effets, un seul ecouteur de defilement, et tout passe par
   requestAnimationFrame : sur un telephone modeste de Kinshasa, un
   ecouteur qui calcule a chaque pixel coute plus cher que l'effet
   ne rapporte.
   Rien ici ne s'execute si le visiteur demande moins d'animation.
   ══════════════════════════════════════════════════════════════ */
function initRelief() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const liseré = document.querySelector('[data-progression]');
  const flottants = [...document.querySelectorAll('[data-parallaxe]')];
  if (!liseré && !flottants.length) return;

  let enCours = false;
  const maj = () => {
    enCours = false;
    if (liseré) {
      const course = document.documentElement.scrollHeight - window.innerHeight;
      const p = course > 0 ? Math.min(1, window.scrollY / course) : 0;
      liseré.style.setProperty('--p', String(p));
    }
    for (const noeud of flottants) {
      const force = parseFloat(noeud.dataset.parallaxe) || 0;
      noeud.style.setProperty('--y', `${(window.scrollY * force).toFixed(1)}px`);
    }
  };
  window.addEventListener('scroll', () => {
    if (enCours) return;
    enCours = true;
    window.requestAnimationFrame(maj);
  }, { passive: true });
  maj();

  /* Les cartes suivent le pointeur, tres legerement. Au doigt on ne
     fait rien : un survol qui reste colle apres le tap est pire que
     pas d'effet du tout. */
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  for (const carte of document.querySelectorAll('#objet .card, #cooperations .card')) {
    carte.addEventListener('pointermove', (evt) => {
      const r = carte.getBoundingClientRect();
      const x = (evt.clientX - r.left) / r.width - 0.5;
      const y = (evt.clientY - r.top) / r.height - 0.5;
      carte.style.setProperty('--rx', `${(-y * 4).toFixed(2)}deg`);
      carte.style.setProperty('--ry', `${(x * 5).toFixed(2)}deg`);
    });
    carte.addEventListener('pointerleave', () => {
      carte.style.removeProperty('--rx');
      carte.style.removeProperty('--ry');
    });
  }
}

initLanguage();
initNavigation();
initMouvement();
initYear();
initContactForm(document.querySelector('#contact-form'));
initLoupe();
initRelief();
