const AUTH_LOGIN_URL = 'https://auth.alfares.cz/login';
const AUTH_CLIENT_ID = 'leads-microservice';
const TOKEN_KEY = 'leadsAdminAuthToken';
const STATE_KEY = 'leadsAdminAuthState';
const RETURN_PATH_KEY = 'leadsAdminReturnPath';
const EXPIRES_KEY = 'leadsAdminAuthExpiresAt';

const state = { token: sessionStorage.getItem(TOKEN_KEY) || '', leads: [], total: 0, selectedLeadId: '', qualifications: [] };
const loginButton = document.querySelector('#admin-login-button');
const logoutButton = document.querySelector('#admin-logout-button');
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
async function postJson(url, body) { const response = await fetch(url, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers()), body: JSON.stringify(body) }); if (!response.ok) { const error = new Error('HTTP ' + response.status); error.status = response.status; throw error; } return response.json(); }

function currentAdminPath() {
  if (typeof window === 'undefined' || !window.location) return '/admin';
  return (window.location.pathname || '/admin') + (window.location.search || '');
}

function callbackUrl() {
  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://leads.alfares.cz';
  return new URL('/auth/callback.html', origin).toString();
}

function randomState() {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
  }
  return String(Date.now()) + String(Math.random()).slice(2);
}

function hostedLoginUrl() {
  const csrfState = randomState();
  sessionStorage.setItem(STATE_KEY, csrfState);
  sessionStorage.setItem(RETURN_PATH_KEY, currentAdminPath());
  const url = new URL(AUTH_LOGIN_URL);
  url.searchParams.set('client_id', AUTH_CLIENT_ID);
  url.searchParams.set('return_url', callbackUrl());
  url.searchParams.set('state', csrfState);
  return url.toString();
}

function updateAccessActions() {
  if (loginButton) loginButton.hidden = Boolean(state.token);
  if (logoutButton) logoutButton.hidden = !state.token;
}

function stripAuthFragment() {
  if (typeof window !== 'undefined' && window.history?.replaceState && window.location?.hash) {
    window.history.replaceState(null, document.title, currentAdminPath());
  }
}

function consumeAuthFragment() {
  if (typeof window === 'undefined' || !window.location?.hash) return 'none';
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const accessToken = String(params.get('access_token') || '').trim();
  if (!accessToken) return 'none';

  const returnedState = String(params.get('state') || '').trim();
  const expectedState = String(sessionStorage.getItem(STATE_KEY) || '').trim();
  stripAuthFragment();
  if (!expectedState || returnedState !== expectedState) {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);
    sessionStorage.removeItem(STATE_KEY);
    state.token = '';
    return 'invalid';
  }

  state.token = accessToken;
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  const expiresAt = String(params.get('expires_at') || '').trim();
  if (expiresAt) sessionStorage.setItem(EXPIRES_KEY, expiresAt);
  sessionStorage.removeItem(STATE_KEY);
  return 'accepted';
}

function clearSession() {
  state.token = '';
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EXPIRES_KEY);
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(RETURN_PATH_KEY);
  updateAccessActions();
  renderAccessRequired();
  setStatus('Signed out of the Leads admin view.', 'neutral');
}

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
  detailEl.innerHTML = '<div class="detail-item"><strong>Lead record</strong><span>Identifier hidden in browser view</span></div><div class="detail-item"><strong>' + safe(lead.status) + '</strong><span>Status - ' + safe(formatDate(lead.createdAt)) + '</span></div><div class="detail-item"><strong>' + safe(lead.sourceService) + '</strong><span>Source service</span></div><div class="detail-item"><strong>' + safe(consentLabel(lead)) + '</strong><span>' + (lead.consentEvidencePresent ? 'Consent evidence present' : 'Consent evidence missing') + '</span></div><div class="detail-item"><strong>' + (lead.confirmedAt ? 'Confirmed' : 'Pending confirmation') + '</strong><span>' + safe(formatDate(lead.confirmedAt)) + '</span></div><div class="detail-item"><strong>' + (lead.unsubscribedAt ? 'Unsubscribed' : 'Subscribed state active') + '</strong><span>' + safe(formatDate(lead.unsubscribedAt)) + '</span></div>' + contacts + qualificationBlock();
}

/**
 * S6 — the manual marking surface (C-006 §1).
 *
 * Two buttons and a reason box, rendered inside the lead detail that already exists. This is the
 * whole of "how the owner qualifies a lead": he works it on WhatsApp or e-mail, comes back, and
 * says what he concluded. Nothing here computes a verdict — `v1-owner-manual` means a human
 * decides and the system records.
 *
 * The history is rendered underneath, superseded judgements included. A panel that showed only
 * the current verdict would answer "is this qualified" and silently lose "we changed our mind".
 */
function qualificationBlock() {
  const history = (state.qualifications || []).map((row) => {
    const superseded = row.supersedesQualificationId ? ' - corrects an earlier judgement' : '';
    const unannounced = row.announcedAt ? '' : ' - not yet announced to growth';
    return '<div class="detail-item"><strong>' + safe(row.qualificationStatus) + '</strong><span>' + safe(formatDate(row.decidedAt)) + ' - ' + safe(row.reason) + safe(superseded, '') + safe(unannounced, '') + '</span></div>';
  }).join('');

  const current = state.qualifications?.[0];
  // "pending" is not a stored value anywhere — it is the absence of any judgement, and this is the
  // only place the word should appear (C-006 section 1.1).
  const heading = current ? safe(current.qualificationStatus) : 'pending';

  return '<div class="detail-item"><strong>Qualification: ' + heading + '</strong><span>v1-owner-manual - complete contact, detailed request, and the person replied on some channel</span></div>'
    + '<div class="detail-item"><input id="qualification-reason" type="text" placeholder="Why? (required)" maxlength="500">'
    + '<button type="button" data-qualify="qualified">Qualified</button>'
    + '<button type="button" data-qualify="disqualified">Disqualified</button></div>'
    + history;
}

function renderHiddenDetail() {
  detailEl.innerHTML = detailMessage('Details unavailable', 'The selected record is not visible in this admin session or is no longer available.');
}

function renderAccessRequired() {
  state.leads = [];
  state.total = 0;
  clearMetrics();
  setText('#source-count', 'Locked');
  document.querySelector('#source-bars').innerHTML = panelMessage('Sign in with hosted Auth to load source activity.');
  document.querySelector('#consent-health').innerHTML = panelMessage('Sign in with hosted Auth to evaluate consent state.');
  document.querySelector('#confirmation-list').innerHTML = panelMessage('Sign in with hosted Auth to view confirmation state.');
  setText('#table-count', 'Locked');
  rowsEl.innerHTML = emptyRow('Hosted Auth sign-in required', 'Use the Auth-hosted session flow to load the Leads admin dashboard.');
  detailEl.innerHTML = detailMessage('Access required', 'Lead details are hidden until a hosted Auth session is available.');
  updateAccessActions();
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
  setStatus('Access denied for this Leads admin view. Check account access, then sign in again.', 'risk');
  updateAccessActions();
}

function renderAll() {
  updateMetrics();
  renderSources();
  renderHealth();
  renderQueue();
  renderRows();
  renderDetail(state.leads[0]);
  updateAccessActions();
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
    setStatus('Sign in with hosted Auth to load lead data.', 'warn');
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

loginButton?.addEventListener('click', () => {
  const url = hostedLoginUrl();
  if (typeof window !== 'undefined' && window.location?.assign) window.location.assign(url);
});

logoutButton?.addEventListener('click', () => {
  clearSession();
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
  state.selectedLeadId = lead.id;
  // Cleared before the fetch, not after: leaving the previous lead's judgements on screen while
  // the new one loads would show one lead's verdict against another lead's details.
  state.qualifications = [];
  renderDetail(lead);
  try {
    const detail = await fetchJson('/api/admin/leads/' + encodeURIComponent(lead.id));
    await loadQualifications(lead.id);
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

async function loadQualifications(leadId) {
  try {
    const payload = await fetchJson('/api/admin/leads/' + encodeURIComponent(leadId) + '/qualification');
    state.qualifications = payload.items || [];
  } catch (error) {
    // A missing history must not blank the lead detail behind it. Empty here reads as "pending",
    // which is exactly what an unqualified lead is, so the wrong answer is a benign one.
    state.qualifications = [];
  }
}

detailEl?.addEventListener('click', async (event) => {
  const button = event.target.closest?.('[data-qualify]');
  if (!button) return;

  const leadId = state.selectedLeadId;
  if (!leadId) return;

  const input = detailEl.querySelector?.('#qualification-reason');
  const reason = String(input?.value || '').trim();
  // Refused in the browser as well as on the server. A defaulted reason looks complete and
  // carries nothing, and the owner is the person who will later ask why a lead was written off.
  if (!reason) {
    setStatus('A reason is required before qualifying a lead.', 'warn');
    return;
  }

  try {
    // A correction is a new judgement naming the one it replaces — never an edit. Sending
    // supersedes only when a previous judgement exists keeps the first one clean.
    const previous = state.qualifications?.[0];
    const body = { qualificationStatus: button.dataset.qualify, reason };
    if (previous?.id) body.supersedesQualificationId = previous.id;

    const result = await postJson('/api/admin/leads/' + encodeURIComponent(leadId) + '/qualification', body);
    await loadQualifications(leadId);
    renderDetail(state.leads.find((lead) => lead.id === leadId));

    setStatus(
      result.announced
        ? 'Judgement recorded and announced.'
        : 'Judgement recorded. It has NOT reached growth yet - the broker did not confirm.',
      result.announced ? 'ok' : 'warn',
    );
  } catch (error) {
    const status = errorStatus(error);
    if (status === 401 || status === 403) { renderUnauthorized(); return; }
    if (status === 400) { setStatus('The judgement was rejected: a status and a non-empty reason are required.', 'risk'); return; }
    setStatus('The judgement could not be recorded.', 'risk');
  }
});

const authFragmentState = consumeAuthFragment();
if (state.token) {
  loadLeads().catch((error) => handleLoadError(error, authFragmentState === 'accepted' ? 'Hosted Auth session was accepted, but dashboard load failed.' : 'Stored hosted Auth session failed.'));
} else {
  renderAccessRequired();
  setStatus(authFragmentState === 'invalid' ? 'Auth session could not be verified. Sign in again.' : 'Sign in with hosted Auth to load lead data.', authFragmentState === 'invalid' ? 'risk' : 'warn');
}
