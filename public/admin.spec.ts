import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as vm from 'vm';

type MockElement = {
  textContent: string;
  className: string;
  innerHTML: string;
  dataset: Record<string, string>;
  value: string;
  values: Record<string, string>;
  hidden: boolean;
  listeners: Record<string, (event: any) => Promise<void> | void>;
  addEventListener: (event: string, handler: (event: any) => Promise<void> | void) => void;
};

function element(values: Record<string, string> = {}): MockElement {
  return {
    textContent: '',
    className: '',
    innerHTML: '',
    dataset: {},
    value: '',
    values,
    hidden: false,
    listeners: {},
    addEventListener(event, handler) {
      this.listeners[event] = handler;
    },
  };
}

function loadAdmin(fetchMock: jest.Mock, options: { sessionToken?: string; hash?: string; expectedState?: string } = {}) {
  const ids = [
    'admin-login-button',
    'admin-logout-button',
    'lead-filter-form',
    'admin-status',
    'lead-rows',
    'lead-detail',
    'metric-total',
    'metric-confirmed',
    'metric-consent',
    'metric-unsubscribed',
    'source-bars',
    'source-count',
    'consent-health',
    'confirmation-list',
    'table-count',
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, element()])) as Record<string, MockElement>;
  elements['lead-filter-form'].values = { sourceService: '', startDate: '', endDate: '', limit: '30' };

  const session = {
    leadsAdminAuthToken: options.sessionToken || '',
    leadsAdminAuthState: options.expectedState || '',
  } as Record<string, string>;
  const assignedUrls: string[] = [];
  const replaceState = jest.fn();
  const context = {
    document: {
      title: 'Leads admin',
      querySelector(selector: string) {
        return elements[selector.replace('#', '')] ?? null;
      },
    },
    window: {
      location: {
        origin: 'https://leads.alfares.cz',
        pathname: '/admin',
        search: '',
        hash: options.hash || '',
        assign(url: string) { assignedUrls.push(url); },
      },
      history: { replaceState },
    },
    sessionStorage: {
      getItem(key: string) { return session[key] ?? ''; },
      setItem(key: string, value: string) { session[key] = value; },
      removeItem(key: string) { delete session[key]; },
    },
    crypto: { getRandomValues(values: Uint8Array) { values.fill(7); return values; } },
    FormData: class MockFormData {
      private values: Record<string, string>;
      constructor(form: MockElement) { this.values = form.values; }
      get(key: string) { return this.values[key] ?? ''; }
    },
    URL,
    URLSearchParams,
    Uint8Array,
    Intl,
    Date,
    Error,
    Math,
    fetch: fetchMock,
  };
  vm.createContext(context);
  const script = readFileSync(resolve(process.cwd(), 'public/admin.js'), 'utf8');
  vm.runInContext(script, context);
  return { elements, session, assignedUrls, replaceState };
}

async function flushPromises() {
  for (let index = 0; index < 6; index += 1) {
    await Promise.resolve();
  }
}

function okJson(body: unknown) {
  return { ok: true, status: 200, json: jest.fn().mockResolvedValue(body) };
}

function errorResponse(status: number) {
  return { ok: false, status, json: jest.fn(), text: jest.fn() };
}

describe('admin static UI hosted Auth states', () => {
  it('renders hosted-auth sign-in state before any admin fetch', () => {
    const fetchMock = jest.fn();
    const { elements } = loadAdmin(fetchMock);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(elements['admin-status'].textContent).toContain('Sign in with hosted Auth');
    expect(elements['lead-rows'].innerHTML).toContain('Hosted Auth sign-in required');
    expect(elements['lead-detail'].innerHTML).toContain('Access required');
    expect(elements['admin-login-button'].hidden).toBe(false);
    expect(elements['admin-logout-button'].hidden).toBe(true);
  });

  it('starts hosted Auth login with client, callback, and state', () => {
    const fetchMock = jest.fn();
    const { elements, assignedUrls, session } = loadAdmin(fetchMock);

    elements['admin-login-button'].listeners.click({});

    expect(assignedUrls).toHaveLength(1);
    const url = new URL(assignedUrls[0]);
    expect(url.origin + url.pathname).toBe('https://auth.alfares.cz/login');
    expect(url.searchParams.get('client_id')).toBe('leads-microservice');
    expect(url.searchParams.get('return_url')).toBe('https://leads.alfares.cz/auth/callback.html');
    expect(url.searchParams.get('state')).toBe(session.leadsAdminAuthState);
    expect(session.leadsAdminReturnPath).toBe('/admin');
  });

  it('accepts a hosted Auth fragment, strips it, and fetches with bearer session', async () => {
    const fetchMock = jest.fn().mockResolvedValue(okJson({ items: [], total: 0, page: 1, limit: 30 }));
    const { elements, session, replaceState } = loadAdmin(fetchMock, {
      expectedState: 'state-1',
      hash: '#access_token=fragment-token&state=state-1&expires_at=2026-06-24T10%3A00%3A00.000Z',
    });

    await flushPromises();

    expect(session.leadsAdminAuthToken).toBe('fragment-token');
    expect(session.leadsAdminAuthExpiresAt).toBe('2026-06-24T10:00:00.000Z');
    expect(replaceState).toHaveBeenCalledWith(null, 'Leads admin', '/admin');
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/leads?limit=30&page=1', { headers: { Authorization: 'Bearer fragment-token' } });
    expect(elements['admin-status'].textContent).toBe('No leads are visible for the current access and filters.');
  });

  it('rejects hosted Auth fragments with invalid state before any admin fetch', () => {
    const fetchMock = jest.fn();
    const { elements, session } = loadAdmin(fetchMock, {
      expectedState: 'state-1',
      hash: '#access_token=fragment-token&state=wrong-state',
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(session.leadsAdminAuthToken).toBeUndefined();
    expect(elements['admin-status'].textContent).toBe('Auth session could not be verified. Sign in again.');
  });

  it('renders scoped-empty state without implying hidden external data', async () => {
    const fetchMock = jest.fn().mockResolvedValue(okJson({ items: [], total: 0, page: 1, limit: 30 }));
    const { elements } = loadAdmin(fetchMock, { sessionToken: 'session-token' });

    await flushPromises();

    expect(elements['admin-status'].textContent).toBe('No leads are visible for the current access and filters.');
    expect(elements['lead-rows'].innerHTML).toContain('No leads are visible for the current access and filters.');
    expect(elements['lead-rows'].innerHTML).not.toContain('workspace');
    expect(elements['lead-detail'].innerHTML).toContain('No lead selected');
  });

  it('renders unauthorized state without reading response bodies', async () => {
    const response = errorResponse(403);
    const fetchMock = jest.fn().mockResolvedValue(response);
    const { elements } = loadAdmin(fetchMock, { sessionToken: 'session-token' });

    await flushPromises();

    expect(response.text).not.toHaveBeenCalled();
    expect(response.json).not.toHaveBeenCalled();
    expect(elements['admin-status'].textContent).toContain('Access denied for this Leads admin view');
    expect(elements['lead-rows'].innerHTML).toContain('Dashboard unavailable');
  });

  it('renders hidden detail state and avoids source metadata fields', async () => {
    const listLead = {
      id: 'lead_ui_1',
      status: 'submitted',
      sourceService: 'shop-assistant',
      contactMethods: [{ type: 'email', isPrimary: true }],
      marketingConsent: true,
      consentEvidencePresent: true,
      preferredChannel: 'email',
      fallbackChannelCount: 0,
      createdAt: '2026-06-13T10:00:00.000Z',
      confirmedAt: null,
      unsubscribedAt: null,
    };
    const fetchMock = jest.fn()
      .mockResolvedValueOnce(okJson({ items: [listLead], total: 1, page: 1, limit: 30 }))
      .mockResolvedValueOnce(errorResponse(404));
    const { elements } = loadAdmin(fetchMock, { sessionToken: 'session-token' });

    await flushPromises();
    expect(elements['lead-rows'].innerHTML).toContain('shop-assistant');
    const adminScript = readFileSync(resolve(process.cwd(), 'public/admin.js'), 'utf8');
    expect(adminScript).not.toContain(['source', 'Label'].join(''));
    expect(adminScript).not.toContain(['source', 'Host'].join(''));

    await elements['lead-rows'].listeners.click({
      target: { closest: () => ({ dataset: { index: '0' } }) },
    });

    expect(fetchMock.mock.calls[1][0]).toBe('/api/admin/leads/lead_ui_1');
    expect(elements['admin-status'].textContent).toBe('Selected lead details are unavailable for this admin session.');
    expect(elements['lead-detail'].innerHTML).toContain('Details unavailable');
    expect(elements['lead-detail'].innerHTML).not.toContain('workspace');
  });
});
