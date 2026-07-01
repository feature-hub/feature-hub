/* @jest-environment node */

import {Action, type History} from 'history';
import {adaptV7History} from './adaptV7History';

type ChangeableHistory = History & {
  set action(value: Action);
  set location(value: History['location']);
};

describe('adaptV7History', () => {
  let history: ChangeableHistory;
  let adaptedHistory: ReturnType<typeof adaptV7History>;
  let listenCallback: ((update: any) => void) | undefined;
  const originalWindow = global.window;

  beforeEach(() => {
    listenCallback = undefined;

    history = {
      action: 'PUSH',
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

    adaptedHistory = adaptV7History(history);
  });

  afterEach(() => {
    if (originalWindow === undefined) {
      delete (global as any).window;
    } else {
      global.window = originalWindow;
    }
  });

  it('maps action values', () => {
    expect(adaptedHistory.action).toBe(Action.Push);

    history.action = Action.Replace;
    expect(adaptedHistory.action).toBe(Action.Replace);

    history.action = Action.Pop;
    expect(adaptedHistory.action).toBe(Action.Pop);
  });

  it('exposes current location and defaults missing key', () => {
    expect(adaptedHistory.location).toEqual({
      pathname: '/initial',
      search: '?q=1',
      hash: '#top',
      state: {from: 'test'},
      key: 'history-key',
    });

    history.location = {...history.location, key: undefined} as any;
    expect(adaptedHistory.location.key).toBe('default');
  });

  it('creates hrefs from strings and path objects', () => {
    expect(adaptedHistory.createHref('/path')).toBe('/path');
    expect(adaptedHistory.createHref('/path?a=1#b')).toBe('/path?a=1#b');
    expect(adaptedHistory.createHref({pathname: '/path'})).toBe('/path');
    expect(
      adaptedHistory.createHref({
        pathname: '/path',
        search: '?a=1',
        hash: '#b',
      }),
    ).toBe('/path?a=1#b');
    expect(adaptedHistory.createHref({search: '?only=1'})).toBe('/?only=1');
    expect(adaptedHistory.createHref({hash: '#b'})).toBe('/#b');
    expect(adaptedHistory.createHref({search: '?only=1', hash: '#b'})).toBe(
      '/?only=1#b',
    );
  });

  it('creates URLs using window.location.href as base', () => {
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
    expect(adaptedHistory.createURL({hash: '#b'}).toString()).toBe(
      'http://localhost/#b',
    );
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

    expect(adaptedHistory.encodeLocation({pathname: '/path'})).toEqual({
      pathname: '/path',
      search: '',
      hash: '',
    });

    expect(
      adaptedHistory.encodeLocation({search: '?only=1', hash: '#b'}),
    ).toEqual({
      pathname: '/',
      search: '?only=1',
      hash: '#b',
    });
  });

  it('delegates navigation methods', () => {
    adaptedHistory.push('/push', {from: 'push'});
    adaptedHistory.replace('/replace', {from: 'replace'});
    adaptedHistory.go(-2);
    adaptedHistory.push(
      {pathname: '/object-push', hash: '#hash'},
      {
        from: 'object-push',
      },
    );
    adaptedHistory.replace(
      {search: '?mode=replace'},
      {
        from: 'object-replace',
      },
    );

    expect(history.push).toHaveBeenCalledWith('/push', {from: 'push'});
    expect(history.replace).toHaveBeenCalledWith('/replace', {from: 'replace'});
    expect(history.go).toHaveBeenCalledWith(-2);
    expect(history.push).toHaveBeenCalledWith('/object-push#hash', {
      from: 'object-push',
    });
    expect(history.replace).toHaveBeenCalledWith('/?mode=replace', {
      from: 'object-replace',
    });
  });

  it('adapts listen callbacks and returns unsubscribe', () => {
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
      action: Action.Push,
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

    listenCallback?.({
      action: 'PUSH',
      location: {
        pathname: '/default-key',
        search: '',
        hash: '',
        state: null,
        key: undefined,
      },
    });

    expect(listener).toHaveBeenNthCalledWith(1, {
      action: Action.Replace,
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
      action: Action.Pop,
      location: {
        pathname: '/popped',
        search: '',
        hash: '',
        state: null,
        key: 'pop-key',
      },
      delta: null,
    });

    expect(listener).toHaveBeenNthCalledWith(3, {
      action: Action.Push,
      location: {
        pathname: '/default-key',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      },
      delta: null,
    });
  });
});
