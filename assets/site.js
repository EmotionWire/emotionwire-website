(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  if (toggle && nav) {
    const close = () => { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); };
    toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
    nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') { close(); toggle.focus(); } });
    window.addEventListener('resize', () => { if (window.innerWidth > 800) close(); });
  }
  const form = document.querySelector('#call-form');
  if (!form) return;
  const config = window.EMOTIONWIRE_CONFIG || {};
  const endpoint = (config.formEndpoint || '').trim();
  const recipient = config.contactEmail || 'amit.dangle@emotionwire.co';
  const status = document.querySelector('#form-status');
  const mode = document.querySelector('#form-mode');
  if (endpoint) mode.textContent = 'Send your request securely using this form.';
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (String(data.get('website') || '').trim()) return;
    status.replaceChildren();
    status.className = '';
    const email = String(data.get('email') || '').trim();
    if (/[\r\n]/.test(email)) { status.textContent = 'Please enter a valid email address.'; return; }
    if (!endpoint) {
      const body = `Free 30-minute call request\n\nName: ${String(data.get('name')).trim()}\nWork email: ${email}\nCompany: ${String(data.get('company')).trim()}\nArea: ${data.get('area')}\n\nMessage:\n${String(data.get('message') || '').trim()}\n\nPlease suggest a convenient time.`;
      const url = `mailto:${recipient}?subject=${encodeURIComponent('Free 30-minute call request')}&body=${encodeURIComponent(body)}`;
      const p = document.createElement('p'); p.textContent = 'Send the email draft to request your call. If your email app did not open, use the link below or email me directly.';
      const link = document.createElement('a'); link.href = url; link.className = 'text-link'; link.textContent = 'Open my email draft →';
      status.append(p, link); status.className = 'form-notice';
      window.location.href = url;
      return;
    }
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true; submit.textContent = 'Sending…';
    try {
      const parsed = new URL(endpoint);
      if (parsed.protocol !== 'https:') throw new Error('Invalid endpoint');
      const response = await fetch(parsed.href, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Request rejected');
      status.className = 'form-notice';
      status.textContent = 'Thanks — your request has been submitted. I’ll follow up to arrange a convenient time.';
      form.reset();
    } catch (_) {
      status.className = 'form-notice error';
      status.textContent = 'Your request could not be submitted. Please email ' + recipient + ' to arrange your call.';
    } finally { submit.disabled = false; submit.innerHTML = 'Request my free call <span aria-hidden="true">→</span>'; }
  });
})();
