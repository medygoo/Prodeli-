const PRODELI_EMAIL = 'contact@prodeli-sarlu.cc.cd';

export function buildMailto({ name = '', email = '', subject = '', message = '' } = {}) {
  const params = new URLSearchParams();
  params.set('subject', subject.trim() || 'Contact PRODELI');
  params.set('body', [
    `Nom / Name: ${name.trim()}`,
    `E-mail: ${email.trim()}`,
    '',
    message.trim()
  ].join('\n'));
  return `mailto:${PRODELI_EMAIL}?${params.toString()}`;
}

export function initContactForm(form) {
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const href = buildMailto({
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      subject: String(data.get('subject') || ''),
      message: String(data.get('message') || '')
    });
    window.location.href = href;
  });
}
