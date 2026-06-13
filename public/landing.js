const form = document.querySelector('#lead-request-form');
const statusEl = document.querySelector('#request-status');
function setStatus(message, type = 'neutral') { statusEl.textContent = message; statusEl.className = `form-status ${type}`; }
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const consent = data.get('marketingConsent') === 'on';
  const payload = {
    sourceService: 'leads-landing',
    sourceUrl: window.location.href,
    sourceLabel: 'Leads landing page',
    message: `${data.get('message')}\n\nCompany: ${data.get('company')}`,
    contactMethods: [{ type: 'email', value: String(data.get('email') || '').trim() }],
    metadata: { name: String(data.get('name') || '').trim(), company: String(data.get('company') || '').trim() },
    preferredChannel: 'email',
    marketingConsent: consent,
  };
  if (consent) { payload.consentSource = 'leads-landing-request-access-checkbox'; payload.consentCapturedAt = new Date().toISOString(); }
  setStatus('Sending request...');
  try {
    const response = await fetch('/api/leads/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`Request failed with HTTP ${response.status}`);
    form.reset();
    setStatus('Request received. Confirmation delivery will run through the configured notifications service.', 'ok');
  } catch (error) { setStatus(error instanceof Error ? error.message : 'Request failed.', 'risk'); }
});
