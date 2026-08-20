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

initLanguage();
initNavigation();
initMouvement();
initYear();
initContactForm(document.querySelector('#contact-form'));
