import assert from 'node:assert/strict';
import test from 'node:test';
import {
  attachChatWidgetDeferredLoad,
  CHAT_LOAD_FALLBACK_MS,
} from '../lib/chat-widget-deferred-load.ts';

type Listener = EventListener;

function fakeWindow() {
  const listeners = new Map<string, Set<Listener>>();
  let scrollY = 0;
  return {
    setScrollY(y: number) {
      scrollY = y;
    },
    addEventListener: (type: string, listener: Listener, _opts?: unknown) => {
      const set = listeners.get(type) ?? new Set();
      set.add(listener);
      listeners.set(type, set);
    },
    removeEventListener: (type: string, listener: Listener) => {
      listeners.get(type)?.delete(listener);
    },
    dispatch: (type: string) => {
      const set = listeners.get(type);
      if (!set) return;
      set.forEach((listener) => listener(new Event(type)));
    },
    get scrollY() {
      return scrollY;
    },
    clearTimeout: globalThis.clearTimeout,
    setTimeout: globalThis.setTimeout,
  };
}

test('does not load on programmatic scroll without wheel/touchmove', () => {
  const originalWindow = globalThis.window;
  const win = fakeWindow();
  let loads = 0;
  Object.defineProperty(globalThis, 'window', { configurable: true, value: win });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { readyState: 'complete' },
  });
  try {
    const handle = attachChatWidgetDeferredLoad(() => {
      loads += 1;
    });
    win.setScrollY(100);
    win.dispatch('scroll');
    assert.equal(loads, 0);
    handle.cancel();
  } finally {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
  }
});

test('loads after wheel when scrollY > 0', () => {
  const originalWindow = globalThis.window;
  const win = fakeWindow();
  let loads = 0;
  Object.defineProperty(globalThis, 'window', { configurable: true, value: win });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { readyState: 'complete' },
  });
  try {
    attachChatWidgetDeferredLoad(() => {
      loads += 1;
    });
    win.setScrollY(40);
    win.dispatch('wheel');
    win.dispatch('scroll');
    assert.equal(loads, 1);
  } finally {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
  }
});

test('fallback uses CHAT_LOAD_FALLBACK_MS after load', () => {
  const source = attachChatWidgetDeferredLoad.toString();
  assert.equal(CHAT_LOAD_FALLBACK_MS, 15_000);
  assert.match(source, /setTimeout\(run,\s*CHAT_LOAD_FALLBACK_MS\)/);
});
