import { initContactForm } from './contact.js';
import { normalizeLanguage, translations } from './i18n.js';

const STORAGE_KEY = 'prodeli-language';

function ensureSchoolSafeLink() {
  const projectCopy = document.querySelector('.project-copy');
  if (!projectCopy || projectCopy.querySelector('[data-schoolsafe-link]')) return;

  const link = document.createElement('a');
  link.href = 'https://schoolsafe1.cc.cd';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className = 'button button-primary';
  link.dataset.schoolsafeLink = '';
  link.textContent = 'Découvrir SchoolSafe';
  link.setAttribute('aria-label', 'Découvrir SchoolSafe dans un nouvel onglet');
  projectCopy.append(link);
}

export function translatePage(language) {
  const lang = normalizeLanguage(language);
  const catalog = translations[lang];

  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    if (catalog[key]) node.textContent = catalog[key];
  });

  const schoolSafeLink = document.querySelector('[data-schoolsafe-link]');
  if (schoolSafeLink) {
    const isEnglish = lang === 'en';
    schoolSafeLink.textContent = isEnglish ? 'Discover SchoolSafe' : 'Découvrir SchoolSafe';
    schoolSafeLink.setAttribute(
      'aria-label',
      isEnglish
        ? 'Discover SchoolSafe in a new tab'
        : 'Découvrir SchoolSafe dans un nouvel onglet'
    );
  }

  document.querySelectorAll('[data-lang]').forEach((button) => {
    const active = button.dataset.lang === lang;
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('is-active', active);
  });

  localStorage.setItem(STORAGE_KEY, lang);
  return lang;
}

function initLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  translatePage(saved || 'fr');

  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => translatePage(button.dataset.lang));
  });
}

function initNavigation() {
  const button = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-menu]');
  if (!button || !nav) return;

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      button.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    });
  });
}

function initYear() {
  const node = document.querySelector('[data-year]');
  if (node) node.textContent = String(new Date().getFullYear());
}

ensureSchoolSafeLink();
initLanguage();
initNavigation();
initYear();
initContactForm(document.querySelector('#contact-form'));
