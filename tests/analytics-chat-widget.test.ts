import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CTA_EVENT_TIMEOUT_MS } from '../lib/analytics/cta-click.ts';
import {
  CHAT_LEAD_EVENT,
  CHAT_OPEN_EVENT,
  attachChatWidgetAnalytics,
  handleChatBeforeSubmit,
  resetChatWidgetAnalyticsForTests,
} from '../lib/analytics/chat-widget.ts';

type GtagCall = unknown[];
type BeforeSubmit = (values: unknown, host?: unknown) => boolean;

function withWindow(value: unknown, run: () => void): void {
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value,
  });
  try {
    resetChatWidgetAnalyticsForTests();
    run();
  } finally {
    resetChatWidgetAnalyticsForTests();
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
}

function fakeWindow(overrides: Record<string, unknown> = {}) {
  const listeners = new Map<string, Set<EventListener>>();
  return {
    location: { pathname: '/agencia-shopify', search: '?utm_source=li' },
    addEventListener: (type: string, listener: EventListener) => {
      const set = listeners.get(type) ?? new Set();
      set.add(listener);
      listeners.set(type, set);
    },
    removeEventListener: (type: string, listener: EventListener) => {
      listeners.get(type)?.delete(listener);
    },
    dispatchEvent: (event: Event) => {
      const set = listeners.get(event.type);
      if (set) set.forEach((listener) => listener(event));
      return true;
    },
    ...overrides,
  };
}

test('ChatWidget hooks analytics before appending the classic loader', () => {
  const source = readFileSync(new URL('../components/ChatWidget.tsx', import.meta.url), 'utf8');
  const attachAt = source.indexOf('attachChatWidgetAnalytics()');
  const chatScriptAt = source.indexOf('const chat = document.createElement');
  const loaderAt = source.lastIndexOf('HIGHLEVEL_CHAT_WIDGET_LOADER');
  assert(attachAt > 0 && chatScriptAt > attachAt, 'listener must be registered before the widget script');
  assert(loaderAt > chatScriptAt);
  assert.match(source, /data-resources-url.*chat-widget\/loader\.js/);
  assert.match(source, /data-widget-id.*HIGHLEVEL_CHAT_WIDGET_ID/);
});

test('before-submit always allows the chat and never forwards PII', () => {
  const calls: GtagCall[] = [];
  withWindow(fakeWindow({
    gtag: (...args: unknown[]) => {
      calls.push(args);
    },
  }), () => {
    const allowed = handleChatBeforeSubmit({
      name: 'Ana Test',
      email: 'qa+chat@example.com',
      phone: '+584121234567',
    }, { host: 'unused' });

    assert.equal(allowed, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 'event');
    assert.equal(calls[0][1], CHAT_LEAD_EVENT);
    const payload = calls[0][2] as Record<string, unknown>;
    assert.equal(payload.page_path, '/agencia-shopify?utm_source=li');
    assert.equal(payload.event_timeout, CTA_EVENT_TIMEOUT_MS);
    const serialized = JSON.stringify({
      page_path: payload.page_path,
      event_timeout: payload.event_timeout,
    });
    for (const forbidden of ['Ana Test', 'qa+chat@', '584121234567', 'email', 'phone', 'name']) {
      assert(!serialized.includes(forbidden), `payload leaked ${forbidden}`);
    }
  });
});

test('before-submit still returns true when gtag is missing or throws', () => {
  withWindow(fakeWindow({}), () => {
    assert.equal(handleChatBeforeSubmit({ email: 'qa+chat@example.com' }), true);
  });

  withWindow(fakeWindow({
    gtag: () => {
      throw new Error('gtag down');
    },
  }), () => {
    assert.equal(handleChatBeforeSubmit({ email: 'qa+chat@example.com' }), true);
  });
});

test('registers the documented hook once, including after LC_chatWidgetLoaded', () => {
  const registered: BeforeSubmit[] = [];

  withWindow(fakeWindow({
    leadConnector: {
      chatWidget: {
        registerBeforeSubmit: (fn: BeforeSubmit) => {
          registered.push(fn);
        },
        isActive: () => false,
      },
    },
    gtag: () => {},
  }), () => {
    attachChatWidgetAnalytics();
    attachChatWidgetAnalytics();
    assert.equal(registered.length, 1);
    assert.equal(registered[0], handleChatBeforeSubmit);

    window.dispatchEvent(new Event('LC_chatWidgetLoaded'));
    assert.equal(registered.length, 1);
  });
});

test('waits for LC_chatWidgetLoaded when the API is not ready yet', () => {
  const registered: BeforeSubmit[] = [];

  withWindow(fakeWindow({
    gtag: () => {},
  }), () => {
    attachChatWidgetAnalytics();
    assert.equal(registered.length, 0);

    window.leadConnector = {
      chatWidget: {
        registerBeforeSubmit: (fn) => {
          registered.push(fn);
        },
      },
    };
    window.dispatchEvent(new Event('LC_chatWidgetLoaded'));
    assert.equal(registered.length, 1);
    assert.equal(registered[0]({ email: 'hidden@example.com' }), true);
  });
});

test('does nothing invented when registerBeforeSubmit is missing', () => {
  const calls: GtagCall[] = [];
  withWindow(fakeWindow({
    leadConnector: { chatWidget: { isActive: () => true } },
    gtag: (...args: unknown[]) => {
      calls.push(args);
    },
  }), () => {
    assert.doesNotThrow(() => {
      attachChatWidgetAnalytics();
      window.dispatchEvent(new Event('LC_chatWidgetLoaded'));
    });
    assert.equal(calls.length, 0);
  });
});

test('chat_open fires on the documented isActive rising edge, not on close', () => {
  const calls: GtagCall[] = [];
  const observed: Array<{ target: Node; options: MutationObserverInit }> = [];
  let observerCallback: MutationCallback | undefined;
  let active = false;

  const originalObserver = globalThis.MutationObserver;
  const originalElement = globalThis.Element;

  class FakeElement {}
  class FakeMutationObserver {
    constructor(callback: MutationCallback) {
      observerCallback = callback;
    }
    observe(target: Node, options: MutationObserverInit) {
      observed.push({ target, options });
    }
    disconnect() {}
    takeRecords(): MutationRecord[] { return []; }
  }

  Object.defineProperty(globalThis, 'MutationObserver', {
    configurable: true,
    value: FakeMutationObserver,
  });
  Object.defineProperty(globalThis, 'Element', {
    configurable: true,
    value: FakeElement,
  });

  const host = new FakeElement() as unknown as Element;

  try {
    withWindow(fakeWindow({
      gtag: (...args: unknown[]) => {
        calls.push(args);
      },
      leadConnector: {
        chatWidget: {
          registerBeforeSubmit: () => {},
          isActive: () => active,
        },
      },
    }), () => {
      attachChatWidgetAnalytics();
      window.dispatchEvent(new CustomEvent('LC_chatWidgetLoaded', { detail: host }));
      assert.equal(observed.length, 1);
      assert.equal(observed[0].target, host);
      assert.deepEqual(observed[0].options, { attributes: true });
      assert.equal(calls.length, 0);
      assert.equal(typeof observerCallback, 'function');

      active = true;
      observerCallback?.([], {} as MutationObserver);
      assert.equal(calls.length, 1);
      assert.equal(calls[0][1], CHAT_OPEN_EVENT);
      assert.equal((calls[0][2] as { page_path: string }).page_path, '/agencia-shopify?utm_source=li');

      observerCallback?.([], {} as MutationObserver);
      assert.equal(calls.length, 1, 'open must not duplicate while already active');

      active = false;
      observerCallback?.([], {} as MutationObserver);
      assert.equal(calls.length, 1);
    });
  } finally {
    Object.defineProperty(globalThis, 'MutationObserver', {
      configurable: true,
      value: originalObserver,
    });
    Object.defineProperty(globalThis, 'Element', {
      configurable: true,
      value: originalElement,
    });
  }
});
