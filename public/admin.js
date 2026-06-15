const state = { token: sessionStorage.getItem('leadsAdminAuthToken') || '', leads: [], total: 0 };
const authForm = document.querySelector('#admin-auth-form');
const filterForm = document.querySelector('#lead-filter-form');
const statusEl = document.querySelector('#admin-status');
const rowsEl = document.querySelector('#lead-rows');
const detailEl = document.querySelector('#lead-detail');

function text(value, fallback = '-') { return value === null || value === undefined || value === '' ? fallback : String(value); }
function escapeHtml(value) { return text(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
function safe(value, fallback = '-') { return escapeHtml(text(value, fallback)); }
function formatDate(value) { if (!value) return '-'; return new Intl.DateTimeFormat(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value)); }
function setStatus(message, type = 'neutral') { statusEl.textContent = message; statusEl.className = 'form-status ' + type; }
function setText(selector, value) { const element = document.querySelector(selector); if (element) element.textContent = value; }
function headers() { return { Authorization: 'Bearer ' + state.token }; }
function statusClass(lead) { if (lead.unsubscribedAt) return 'risk'; if (!lead.confirmedAt) return 'warn'; return ''; }
function consentLabel(lead) { if (lead.unsubscribedAt) return 'Unsubscribed'; if (lead.marketingConsent === true) return 'Opted in'; if (lead.marketingConsent === false) return 'Opted out'; return 'Unknown'; }
function errorStatus(error) { return error && typeof error === 'object' && 'status' in error ? error.status : undefined; }
function scopedEmptyCopy() { return 'No leads are visible for the current access and filters.'; }
function emptyRow(title, message) { return '<tr class="empty-row"><td colspan="6"><strong>' + safe(title) + '</strong><br><small>' + safe(message) + '</small></td></tr>'; }
function panelMessage(message) { return '<p class="empty-state">' + safe(message) + '</p>'; }
function detailMessage(title, message) { return '<div class="empty-state"><strong>' + safe(title) + '</strong><span>' + safe(message) + '</span></div>'; }
async function fetchJson(url) { const response = await fetch(url, { headers: headers() }); if (!response.ok) { const error = new Error('HTTP ' + response.status); error.status = response.status; throw error; } return response.json(); }

function updateMetrics() {
  const confirmed = state.leads.filter((lead) => lead.confirmedAt).length;
  const consented = state.leads.filter((lead) => lead.marketingConsent === true && !lead.unsubscribedAt).length;
  const unsubscribed = state.leads.filter((lead) => lead.unsubscribedAt).length;
  setText('#metric-total', state.total || state.leads.length || 0);
  setText('#metric-confirmed', confirmed);
  setText('#metric-consent', state.leads.length ? Math.round((consented / state.leads.length) * 100) + '%' : '-');
  setText('#metric-unsubscribed', unsubscribed);
}

function clearMetrics() {
  setText('#metric-total', '-');
  setText('#metric-confirmed', '-');
  setText('#metric-consent', '-');
  setText('#metric-unsubscribed', '-');
}

function renderSources() {
  const counts = new Map();
  state.leads.forEach((lead) => counts.set(lead.sourceService || 'unknown', (counts.get(lead.sourceService || 'unknown') || 0) + 1));
  const max = Math.max(1, ...counts.values());
  const sourceBars = document.querySelector('#source-bars');
  setText('#source-count', counts.size ? counts.size + ' source' + (counts.size === 1 ? '' : 's') : 'No visible sources');
  sourceBars.innerHTML = Array.from(counts.entries()).map(([source, count]) => '<div class="bar-row"><strong>' + safe(source) + '</strong><div class="bar-track"><div class="bar-fill" style="width:' + ((count / max) * 100) + '%"></div></div><span>' + count + '</span></div>').join('') || panelMessage('No visible source activity in this access scope.');
}

function renderHealth() {
  const health = document.querySelector('#consent-health');
  if (!state.leads.length) {
    health.innerHTML = panelMessage('No visible leads to evaluate.');
    return;
  }
  const withEvidence = state.leads.filter((lead) => lead.consentEvidencePresent).length;
  const confirmed = state.leads.filter((lead) => lead.confirmedAt).length;
  health.innerHTML = [['Consent evidence present', withEvidence], ['Confirmation completed', confirmed]].map(([label, count]) => '<div class="health-item"><strong>' + count + ' / ' + state.leads.length + '</strong><span>' + safe(label) + '</span></div>').join('');
}

function renderQueue() {
  const pending = state.leads.filter((lead) => !lead.confirmedAt).slice(0, 6);
  document.querySelector('#confirmation-list').innerHTML = pending.map((lead) => '<div class="queue-item"><strong>' + safe(lead.sourceService) + ' - ' + safe(formatDate(lead.createdAt)) + '</strong><span>' + safe(consentLabel(lead)) + ' - ' + (lead.contactMethods?.length || 0) + ' contact method(s)</span></div>').join('') || panelMessage('No pending confirmations visible in the current window.');
}

function renderRows() {
  setText('#table-count', state.leads.length + ' shown - ' + state.total + ' total');
  if (!state.leads.length) {
    rowsEl.innerHTML = emptyRow(scopedEmptyCopy(), 'Try widening date or source filters, or confirm this admin session has the expected Leads access.');
    return;
  }
  rowsEl.innerHTML = state.leads.map((lead, index) => {
    const contacts = (lead.contactMethods || []).map((item) => safe(item.type) + (item.isPrimary ? ' - primary' : '')).join('<br>') || '-';
    const evidence = lead.consentEvidencePresent ? 'Evidence present' : 'Evidence missing';
    return '<tr data-index="' + index + '"><td>' + safe(formatDate(lead.createdAt)) + '</td><td>' + safe(lead.sourceService) + '</td><td><span class="status-pill ' + statusClass(lead) + '">' + safe(lead.status) + '</span></td><td>' + contacts + '</td><td>' + safe(consentLabel(lead)) + '<br><small>' + safe(evidence) + '</small></td><td>' + safe(lead.preferredChannel) + '<br><small>' + safe(text(lead.fallbackChannelCount, 0)) + ' fallback channel(s)</small></td></tr>';
  }).join('');
}

function renderDetail(lead) {
  if (!lead) {
    detailEl.innerHTML = detailMessage('No lead selected', scopedEmptyCopy());
    return;
  }
  const contacts = (lead.contactMethods || []).map((item) => '<div class="detail-item"><strong>' + safe(item.type) + '</strong><span>' + (item.isPrimary ? 'Primary contact method' : 'Additional contact method') + '</span></div>').join('');
  detailEl.innerHTML = '<div class="detail-item"><strong>Lead record</strong><span>Identifier hidden in browser view</span></div><div class="detail-item"><strong>' + safe(lead.status) + '</strong><span>Status - ' + safe(formatDate(lead.createdAt)) + '</span></div><div class="detail-item"><strong>' + safe(lead.sourceService) + '</strong><span>Source service</span></div><div class="detail-item"><strong>' + safe(consentLabel(lead)) + '</strong><span>' + (lead.consentEvidencePresent ? 'Consent evidence present' : 'Consent evidence missing') + '</span></div><div class="detail-item"><strong>' + (lead.confirmedAt ? 'Confirmed' : 'Pending confirmation') + '</strong><span>' + safe(formatDate(lead.confirmedAt)) + '</span></div><div class="detail-item"><strong>' + (lead.unsubscribedAt ? 'Unsubscribed' : 'Subscribed state active') + '</strong><span>' + safe(formatDate(lead.unsubscribedAt)) + '</span></div>' + contacts;
}

function renderHiddenDetail() {
  detailEl.innerHTML = detailMessage('Details unavailable', 'The selected record is not visible in this admin session or is no longer available.');
}

function renderAccessRequired() {
  state.leads = [];
  state.total = 0;
  clearMetrics();
  setText('#source-count', 'Locked');
  document.querySelector('#source-bars').innerHTML = panelMessage('Enter access credentials to load source activity.');
  document.querySelector('#consent-health').innerHTML = panelMessage('Enter access credentials to evaluate consent state.');
  document.querySelector('#confirmation-list').innerHTML = panelMessage('Enter access credentials to view confirmation state.');
  setText('#table-count', 'Locked');
  rowsEl.innerHTML = emptyRow('Access token required', 'Enter access credentials to load the Leads admin dashboard.');
  detailEl.innerHTML = detailMessage('Access required', 'Lead details are hidden until the dashboard is loaded.');
}

function renderUnauthorized() {
  state.leads = [];
  state.total = 0;
  clearMetrics();
  setText('#source-count', 'Unavailable');
  document.querySelector('#source-bars').innerHTML = panelMessage('Source activity is unavailable for this admin session.');
  document.querySelector('#consent-health').innerHTML = panelMessage('Consent state is unavailable for this admin session.');
  document.querySelector('#confirmation-list').innerHTML = panelMessage('Confirmation state is unavailable for this admin session.');
  setText('#table-count', 'Unavailable');
  rowsEl.innerHTML = emptyRow('Dashboard unavailable', 'This admin session cannot load Leads dashboard data.');
  detailEl.innerHTML = detailMessage('Details unavailable', 'Lead details are unavailable for this admin session.');
  setStatus('Access denied for this Leads admin view. Check account access or credentials, then try again.', 'risk');
}

function renderAll() {
  updateMetrics();
  renderSources();
  renderHealth();
  renderQueue();
  renderRows();
  renderDetail(state.leads[0]);
}

function handleLoadError(error, fallback) {
  const status = errorStatus(error);
  if (status === 401 || status === 403) {
    renderUnauthorized();
    return;
  }
  setStatus(fallback, 'risk');
}

async function loadLeads() {
  if (!state.token) {
    renderAccessRequired();
    setStatus('Enter access credentials to load lead data.', 'warn');
    return;
  }
  const form = new FormData(filterForm);
  const params = new URLSearchParams();
  ['sourceService', 'startDate', 'endDate', 'limit'].forEach((key) => { const value = String(form.get(key) || '').trim(); if (value) params.set(key, value); });
  params.set('page', '1');
  setStatus('Loading dashboard...');
  const payload = await fetchJson('/api/admin/leads?' + params.toString());
  state.leads = payload.items || [];
  state.total = payload.total || state.leads.length;
  renderAll();
  if (!state.leads.length) {
    setStatus(scopedEmptyCopy(), 'warn');
    return;
  }
  setStatus('Dashboard loaded with safe admin fields.', 'ok');
}

authForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(authForm);
  state.token = String(data.get('token') || '').trim();
  sessionStorage.setItem('leadsAdminAuthToken', state.token);
  try { await loadLeads(); } catch (error) { handleLoadError(error, 'Dashboard load failed.'); }
});

filterForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  try { await loadLeads(); } catch (error) { handleLoadError(error, 'Filter request failed.'); }
});

rowsEl?.addEventListener('click', async (event) => {
  const row = event.target.closest('tr[data-index]');
  if (!row) return;
  const lead = state.leads[Number(row.dataset.index)];
  if (!lead?.id) return;
  renderDetail(lead);
  try {
    const detail = await fetchJson('/api/admin/leads/' + encodeURIComponent(lead.id));
    renderDetail(detail);
    setStatus('Selected lead details loaded with safe admin fields.', 'ok');
  } catch (error) {
    const status = errorStatus(error);
    if (status === 404) {
      renderHiddenDetail();
      setStatus('Selected lead details are unavailable for this admin session.', 'warn');
      return;
    }
    if (status === 401 || status === 403) {
      renderUnauthorized();
      return;
    }
    setStatus('Selected lead details could not be loaded.', 'risk');
  }
});

if (state.token) { authForm.token.value = state.token; loadLeads().catch((error) => handleLoadError(error, 'Stored credentials failed.')); } else { renderAccessRequired(); setStatus('Enter access credentials to load lead data.', 'warn'); }
