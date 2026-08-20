const PRODELI_EMAIL = 'contact@prodeli-sarlu.cc.cd';

/* Un mailto: n'est PAS un formulaire HTML.
   URLSearchParams code l'espace en « + », et la RFC 6068 ne demande au client
   mail que de décoder les %XX : le « + » lui arrive tel quel. Le message
   partait donc rempli de « + » à la place des espaces.
   encodeURIComponent code l'espace en %20, que tous les clients décodent. */
const enc = (value) => encodeURIComponent(value).replace(/%0A/g, '%0D%0A');

export function buildMailto({ name = '', email = '', subject = '', message = '' } = {}) {
  const corps = [
    `Nom / Name: ${name.trim()}`,
    `E-mail: ${email.trim()}`,
    '',
    message.trim()
  ].join('\n');
  return `mailto:${PRODELI_EMAIL}?subject=${enc(subject.trim() || 'Contact PRODELI')}&body=${enc(corps)}`;
}

export function initContactForm(form) {
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    window.location.href = buildMailto({
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      subject: String(data.get('subject') || ''),
      message: String(data.get('message') || '')
    });
  });
}
