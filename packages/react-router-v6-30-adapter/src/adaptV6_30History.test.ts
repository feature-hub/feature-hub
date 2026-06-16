/* @jest-environment node */

import type {History} from 'history';
import {Action as RemixAction} from '@remix-run/router';
import {adaptV6_30History} from './adaptV6_30History';

type ChangeableHistory = History & {
  set action(value: string);
  set location(value: History['location']);
};

describe('adaptV6_30History', () => {
  let history: ChangeableHistory;
  let adaptedHistory: ReturnType<typeof adaptV6_30History>;
  // biome-ignore lint/suspicious/noExplicitAny: test case
  let listenCallback: ((update: any) => void) | undefined;
  const originalWindow = global.window;

  beforeEach(() => {
    listenCallback = undefined;

    history = {
      action: RemixAction.Push,
      location: {
        pathname: '/initial',
        search: '?q=1',
        hash: '#top',
        state: {from: 'test'},
        key: 'history-key',
      },
      push: jest.fn(),
      replace: jest.fn(),
      go: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      listen: jest.fn((listener) => {
        listenCallback = listener;
        return jest.fn();
      }),
      block: jest.fn(),
      createHref: jest.fn(),
      length: 1,
    } as ChangeableHistory;

    adaptedHistory = adaptV6_30History(history);
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (originalWindow === undefined) {
      // biome-ignore lint/suspicious/noExplicitAny: test case
      delete (global as any).window;
    } else {
      global.window = originalWindow;
    }
  });

  it('maps the action value', () => {
    expect(adaptedHistory.action).toBe(RemixAction.Push);

    history.action = RemixAction.Replace;
    expect(adaptedHistory.action).toBe(RemixAction.Replace);

    history.action = RemixAction.Pop;
    expect(adaptedHistory.action).toBe(RemixAction.Pop);
  });

  it('exposes the current location', () => {
    expect(adaptedHistory.location).toEqual({
      pathname: '/initial',
      search: '?q=1',
      hash: '#top',
      state: {from: 'test'},
      key: 'history-key',
    });
  });

  it('defaults the location key to default when missing', () => {
    history.location = {
      ...history.location,
      key: undefined,
      // biome-ignore lint/suspicious/noExplicitAny: test case
    } as any;

    expect(adaptedHistory.location.key).toBe('default');
  });

  it('creates hrefs from string and path objects', () => {
    expect(adaptedHistory.createHref('/path')).toBe('/path');
    expect(
      adaptedHistory.createHref({
        pathname: '/path',
        search: '?a=1',
        hash: '#b',
      }),
    ).toBe('/path?a=1#b');
    expect(adaptedHistory.createHref({search: '?a=1'})).toBe('/?a=1');
  });

  it('creates urls using the current window location', () => {
    Object.defineProperty(global, 'window', {
      configurable: true,
      value: {location: {href: 'http://localhost/base?x=1#hash'}},
    });

    expect(adaptedHistory.createURL('/path').toString()).toBe(
      'http://localhost/path',
    );
    expect(
      adaptedHistory.createURL({pathname: '/path', search: '?a=1'}).toString(),
    ).toBe('http://localhost/path?a=1');
  });

  it('encodes locations as path objects', () => {
    expect(adaptedHistory.encodeLocation('/path')).toEqual({
      pathname: '/path',
      search: '',
      hash: '',
    });

    expect(
      adaptedHistory.encodeLocation({
        pathname: '/path',
        search: '?a=1',
        hash: '#b',
      }),
    ).toEqual({
      pathname: '/path',
      search: '?a=1',
      hash: '#b',
    });
  });

  it('delegates navigation methods', () => {
    adaptedHistory.push('/push', {from: 'push'});
    adaptedHistory.replace('/replace', {from: 'replace'});
    adaptedHistory.go(-2);

    expect(history.push).toHaveBeenCalledWith('/push', {from: 'push'});
    expect(history.replace).toHaveBeenCalledWith('/replace', {from: 'replace'});
    expect(history.go).toHaveBeenCalledWith(-2);
  });

  it('adapts listen callbacks and returns the unsubscribe function', () => {
    const unsubscribe = jest.fn();

    (history.listen as jest.Mock).mockImplementation((listener) => {
      listenCallback = listener;
      return unsubscribe;
    });

    const listener = jest.fn();
    const returnedUnsubscribe = adaptedHistory.listen(listener);

    expect(history.listen).toHaveBeenCalledTimes(1);
    expect(returnedUnsubscribe).toBe(unsubscribe);
    expect(listenCallback).toBeDefined();

    listenCallback?.({
      action: 'PUSH',
      location: {
        pathname: '/next',
        search: '',
        hash: '',
        state: {id: 1},
        key: 'next-key',
      },
    });

    expect(listener).toHaveBeenCalledWith({
      action: RemixAction.Push,
      location: {
        pathname: '/next',
        search: '',
        hash: '',
        state: {id: 1},
        key: 'next-key',
      },
      delta: null,
    });
  });

  it('maps replace and pop updates in listener callbacks', () => {
    const listener = jest.fn();
    adaptedHistory.listen(listener);

    listenCallback?.({
      action: 'REPLACE',
      location: {
        pathname: '/replaced',
        search: '',
        hash: '',
        state: null,
        key: 'replace-key',
      },
    });

    listenCallback?.({
      action: 'POP',
      location: {
        pathname: '/popped',
        search: '',
        hash: '',
        state: null,
        key: 'pop-key',
      },
    });

    expect(listener).toHaveBeenNthCalledWith(1, {
      action: RemixAction.Replace,
      location: {
        pathname: '/replaced',
        search: '',
        hash: '',
        state: null,
        key: 'replace-key',
      },
      delta: null,
    });

    expect(listener).toHaveBeenNthCalledWith(2, {
      action: RemixAction.Pop,
      location: {
        pathname: '/popped',
        search: '',
        hash: '',
        state: null,
        key: 'pop-key',
      },
      delta: null,
    });
  });
});
