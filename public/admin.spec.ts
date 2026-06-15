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
  token?: { value: string };
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
    listeners: {},
    addEventListener(event, handler) {
      this.listeners[event] = handler;
    },
  };
}

function loadAdmin(fetchMock: jest.Mock, formToken = '') {
  const ids = [
    'admin-auth-form',
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
  elements['admin-auth-form'].values = { token: formToken };
  elements['admin-auth-form'].token = { value: '' };
  elements['lead-filter-form'].values = { sourceService: '', startDate: '', endDate: '', limit: '30' };

  const session = { leadsAdminAuthToken: '' } as Record<string, string>;
  const context = {
    document: {
      querySelector(selector: string) {
        return elements[selector.replace('#', '')] ?? null;
      },
    },
    sessionStorage: {
      getItem(key: string) { return session[key] ?? ''; },
      setItem(key: string, value: string) { session[key] = value; },
    },
    FormData: class MockFormData {
      private values: Record<string, string>;
      constructor(form: MockElement) { this.values = form.values; }
      get(key: string) { return this.values[key] ?? ''; }
    },
    URLSearchParams,
    Intl,
    Date,
    Error,
    fetch: fetchMock,
  };
  vm.createContext(context);
  const script = readFileSync(resolve(process.cwd(), 'public/admin.js'), 'utf8');
  vm.runInContext(script, context);
  return { elements, session };
}

function okJson(body: unknown) {
  return { ok: true, status: 200, json: jest.fn().mockResolvedValue(body) };
}

function errorResponse(status: number) {
  return { ok: false, status, json: jest.fn(), text: jest.fn() };
}

describe('admin static UI safe states', () => {
  it('renders token-missing state before any admin fetch', () => {
    const fetchMock = jest.fn();
    const { elements } = loadAdmin(fetchMock);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(elements['admin-status'].textContent).toContain('Enter access credentials');
    expect(elements['lead-rows'].innerHTML).toContain('Access token required');
    expect(elements['lead-detail'].innerHTML).toContain('Access required');
  });

  it('renders scoped-empty state without implying hidden external data', async () => {
    const fetchMock = jest.fn().mockResolvedValue(okJson({ items: [], total: 0, page: 1, limit: 30 }));
    const { elements } = loadAdmin(fetchMock, 'credential-for-test');

    await elements['admin-auth-form'].listeners.submit({ preventDefault() {} });

    expect(elements['admin-status'].textContent).toBe('No leads are visible for the current access and filters.');
    expect(elements['lead-rows'].innerHTML).toContain('No leads are visible for the current access and filters.');
    expect(elements['lead-rows'].innerHTML).not.toContain('workspace');
    expect(elements['lead-detail'].innerHTML).toContain('No lead selected');
  });

  it('renders unauthorized state without reading response bodies', async () => {
    const response = errorResponse(403);
    const fetchMock = jest.fn().mockResolvedValue(response);
    const { elements } = loadAdmin(fetchMock, 'credential-for-test');

    await elements['admin-auth-form'].listeners.submit({ preventDefault() {} });

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
    const { elements } = loadAdmin(fetchMock, 'credential-for-test');

    await elements['admin-auth-form'].listeners.submit({ preventDefault() {} });
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
