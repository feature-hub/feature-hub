// tslint:disable:no-non-null-assertion no-unbound-method
import {
  FeatureServiceBinder,
  FeatureServiceBinding,
  FeatureServiceEnvironment
} from '@feature-hub/core';
import {ServerRendererV1, ServerRequest} from '@feature-hub/server-renderer';
import {createPath} from 'history';
import {History, HistoryServiceV1, defineHistoryService} from '..';
import {RootLocationTransformer} from '../root-location-transformer';

const simulateOnPopState = (state: unknown, url: string) => {
  // We need to use pushState to change to the URL that should set by the popstate event.
  history.pushState(state, '', url);
  const popStateEvent = new PopStateEvent('popstate', {state});
  window.dispatchEvent(popStateEvent);
};

const testRootLocationTransformer: RootLocationTransformer = {
  getConsumerPathFromRootLocation: (rootLocation, consumerId) => {
    const searchParams = new URLSearchParams(rootLocation.search);

    return searchParams.get(consumerId) || undefined;
  },

  createRootLocation: (consumerLocation, rootLocation, consumerId) => {
    const searchParams = new URLSearchParams(rootLocation.search);

    if (consumerLocation) {
      searchParams.set(consumerId, createPath(consumerLocation));
    } else {
      searchParams.delete(consumerId);
    }

    return {
      pathname: rootLocation.pathname,
      // decodeURIComponent is used here only for a better readability in the test expectations
      search: decodeURIComponent(searchParams.toString()),
      state: rootLocation.state
    };
  }
};

describe('defineHistoryService', () => {
  it('creates a history service definition', () => {
    const historyServiceDefinition = defineHistoryService({
      createRootLocation: jest.fn(),
      getConsumerPathFromRootLocation: jest.fn()
    });

    expect(historyServiceDefinition.id).toBe('s2:history');

    expect(historyServiceDefinition.dependencies).toEqual({
      's2:server-renderer': '^1.0'
    });
  });

  describe('#create', () => {
    let createHistoryServiceBinder: (
      serverRequest?: ServerRequest,
      rootLocationTransformer?: RootLocationTransformer
    ) => FeatureServiceBinder<HistoryServiceV1>;

    let pushStateSpy: jest.SpyInstance;
    let replaceStateSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      // ensure the window.location.href is the same before each test
      window.history.replaceState(null, '', 'http://example.com');

      pushStateSpy = jest.spyOn(window.history, 'pushState');
      replaceStateSpy = jest.spyOn(window.history, 'replaceState');
      consoleWarnSpy = jest.spyOn(console, 'warn');
      consoleWarnSpy.mockImplementation(jest.fn());

      const mockServerRequest: ServerRequest = {
        path: '/example',
        cookies: {},
        headers: {}
      };

      createHistoryServiceBinder = (
        serverRequest: ServerRequest = mockServerRequest
      ) => {
        const mockServerRenderer: ServerRendererV1 = {serverRequest};

        const mockFeatureServices = {
          's2:server-renderer': mockServerRenderer
        };

        const mockEnv: FeatureServiceEnvironment<
          undefined,
          {'s2:server-renderer': ServerRendererV1}
        > = {
          config: undefined,
          featureServices: mockFeatureServices
        };

        const historyServiceBinder = defineHistoryService(
          testRootLocationTransformer
        ).create(mockEnv)['1.1'] as FeatureServiceBinder<HistoryServiceV1>;

        return historyServiceBinder;
      };
    });

    afterEach(() => {
      pushStateSpy.mockRestore();
      replaceStateSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    describe('#createBrowserHistory()', () => {
      let historyBinding1: FeatureServiceBinding<HistoryServiceV1>;
      let historyBinding2: FeatureServiceBinding<HistoryServiceV1>;
      let history1: History;
      let history2: History;

      const createHistories = () => {
        const historyServiceBinder = createHistoryServiceBinder();

        historyBinding1 = historyServiceBinder('test:1');
        const historyService1 = historyBinding1.featureService;
        history1 = historyService1.createBrowserHistory();

        historyBinding2 = historyServiceBinder('test:2');
        const historyService2 = historyBinding2.featureService;
        history2 = historyService2.createBrowserHistory();
      };

      const destroyHistories = () => {
        historyBinding1.unbind!();
        historyBinding2.unbind!();
      };

      beforeEach(createHistories);
      afterEach(destroyHistories);

      describe('#length', () => {
        it('returns the same root history length for all consumers', () => {
          expect(history1.length).toBe(1);
          expect(history2.length).toBe(1);

          history1.push('/foo');
          history1.push('/bar');
          history1.replace('/qux');
          history2.push('/baz');
          history2.replace('/quux');

          expect(history1.length).toBe(4);
          expect(history2.length).toBe(4);
        });
      });

      describe('#action', () => {
        it('returns a consumer-specific action', () => {
          expect(history1.action).toBe('POP');
          expect(history2.action).toBe('POP');

          history1.push('/foo');
          history2.replace('/bar');

          expect(history1.action).toBe('PUSH');
          expect(history2.action).toBe('REPLACE');
        });
      });

      describe('#location', () => {
        it('returns a consumer-specific location', () => {
          history1.push('/foo', {test: 'foo'});
          history2.replace('/bar', {test: 'bar'});

          expect(history1.location).toMatchObject({
            pathname: '/foo',
            state: {test: 'foo'}
          });

          expect(history2.location).toMatchObject({
            pathname: '/bar',
            state: {test: 'bar'}
          });
        });

        it('retrieves consumer specific locations from the initial location', () => {
          destroyHistories();

          const consumerStates = {'test:1': 'foo state', 'test:2': 'bar state'};
          const url = 'http://example.com?test:1=/foo&test:2=/bar';

          window.history.pushState({state: consumerStates}, '', url);

          createHistories();

          expect(history1.location).toMatchObject({
            pathname: '/foo',
            state: 'foo state'
          });

          expect(history2.location).toMatchObject({
            pathname: '/bar',
            state: 'bar state'
          });
        });

        describe('when getConsumerPathFromRootLocation returns undefined', () => {
          it('returns the default location', () => {
            expect(history1.location).toMatchObject({
              pathname: '/',
              search: ''
            });
          });
        });
      });

      describe('#push()', () => {
        it('pushes an new root location onto the root history for every consumer push', () => {
          history1.push('/foo');
          history2.push('/bar?baz=1');

          expect(window.location.href).toBe(
            'http://example.com/?test:1=/foo&test:2=/bar?baz=1'
          );

          expect(pushStateSpy).toHaveBeenCalledTimes(2);
        });
      });

      describe('#replace()', () => {
        it('replaces the root location in the root history for every consumer replace', () => {
          replaceStateSpy.mockClear();

          history1.replace('/foo');
          history2.replace('/bar?baz=1');

          expect(window.location.href).toBe(
            'http://example.com/?test:1=/foo&test:2=/bar?baz=1'
          );

          expect(replaceStateSpy).toHaveBeenCalledTimes(2);
        });
      });

      describe('#go()', () => {
        it('does nothing and logs a warning that go() is not supported', () => {
          history1.push('foo');

          const href = window.location.href;

          history1.go(-1);

          expect(window.location.href).toBe(href);

          expect(consoleWarnSpy).toHaveBeenCalledWith(
            'history.go() is not supported.'
          );
        });
      });

      describe('#goBack()', () => {
        it('does nothing and logs a warning that goBack() is not supported', () => {
          history1.push('foo');

          const href = window.location.href;

          history1.goBack();

          expect(window.location.href).toBe(href);

          expect(consoleWarnSpy).toHaveBeenCalledWith(
            'history.goBack() is not supported.'
          );
        });
      });

      describe('#goForward()', () => {
        it('does nothing and logs a warning that goForward() is not supported', () => {
          history1.push('foo');

          const href = window.location.href;

          history1.goForward();

          expect(window.location.href).toBe(href);

          expect(consoleWarnSpy).toHaveBeenCalledWith(
            'history.goForward() is not supported.'
          );
        });
      });

      describe('#block()', () => {
        it('does nothing and logs a warning', () => {
          const promptHookSpy = jest.fn();

          history1.block(promptHookSpy);
          history1.push('/foo?bar=1');

          expect(window.location.href).toBe(
            'http://example.com/?test:1=/foo?bar=1'
          );

          expect(promptHookSpy).not.toHaveBeenCalled();

          expect(consoleWarnSpy).toHaveBeenCalledWith(
            'history.block() is not supported.'
          );
        });

        it('still returns a no-op unblock function', () => {
          const promptHookSpy = jest.fn();
          const unblock = history1.block(promptHookSpy);

          unblock();
        });
      });

      describe('#listen()', () => {
        it('calls listeners only for consumer-specific history changes', () => {
          const listenerSpy1 = jest.fn();
          const listenerSpy2 = jest.fn();

          history1.listen(listenerSpy1);
          history2.listen(listenerSpy2);

          history1.push('/foo?bar=1');
          history2.replace('/baz?qux=2');

          expect(listenerSpy1).toHaveBeenCalledTimes(1);

          expect(listenerSpy1).toHaveBeenCalledWith(
            expect.objectContaining({pathname: '/foo', search: '?bar=1'}),
            'PUSH'
          );

          expect(listenerSpy2).toHaveBeenCalledTimes(1);

          expect(listenerSpy2).toHaveBeenCalledWith(
            expect.objectContaining({pathname: '/baz', search: '?qux=2'}),
            'REPLACE'
          );
        });

        it('returns an unregister function', () => {
          const listenerSpy = jest.fn();
          const unregister = history1.listen(listenerSpy);

          history1.push('/foo');
          unregister();
          history1.push('/bar');

          expect(listenerSpy).toHaveBeenCalledTimes(1);
        });

        describe('for a POP action', () => {
          let history1ListenerSpy: jest.Mock;
          let history2ListenerSpy: jest.Mock;

          let unregisterListeners: () => void;

          const registerListeners = () => {
            history1ListenerSpy = jest.fn();
            const unregister1 = history1.listen(history1ListenerSpy);

            history2ListenerSpy = jest.fn();
            const unregister2 = history2.listen(history2ListenerSpy);

            unregisterListeners = () => {
              unregister1();
              unregister2();
            };
          };

          beforeEach(registerListeners);

          it('calls listeners only for matching consumer locations', () => {
            const state = window.history.state;
            const href = window.location.href;

            history1.push('/foo');
            history1ListenerSpy.mockClear();

            simulateOnPopState(state, href);

            expect(history1ListenerSpy).toHaveBeenCalledWith(
              expect.objectContaining({pathname: '/'}),
              'POP'
            );

            expect(history2ListenerSpy).not.toHaveBeenCalled();
          });

          describe('with back and forward navigation', () => {
            it('calls the listener with the correct locations', () => {
              history1.push('/baz?qux=3');

              const state1 = window.history.state;
              const href1 = window.location.href;

              history1.push('/bar?qux=4');

              const state2 = window.history.state;
              const href2 = window.location.href;

              history1ListenerSpy.mockClear();

              simulateOnPopState(state1, href1); // POP backward

              expect(history1ListenerSpy).toHaveBeenCalledWith(
                expect.objectContaining({pathname: '/baz', search: '?qux=3'}),
                'POP'
              );

              history1ListenerSpy.mockClear();

              simulateOnPopState(state2, href2); // POP foward

              expect(history1ListenerSpy).toHaveBeenCalledWith(
                expect.objectContaining({pathname: '/bar', search: '?qux=4'}),
                'POP'
              );
            });
          });

          describe('when a location is replaced', () => {
            it('calls the listener with the correct locations', () => {
              history1.push('/a1');
              history2.push('/b1');
              history1.push('/a2');
              history2.push('/b2');
              history1.replace('/a3');

              const replacedState = window.history.state;
              const replacedHref = window.location.href;

              history2.push('/b3');

              history2ListenerSpy.mockClear();

              simulateOnPopState(replacedState, replacedHref); // POP to replaced location

              expect(history2ListenerSpy).toHaveBeenCalledWith(
                expect.objectContaining({pathname: '/b2'}),
                'POP'
              );
            });
          });

          describe('after re-initializing the history service, e.g. because of a page reload', () => {
            it('calls listeners for matching consumer locations (also restores consumer state)', () => {
              const consumerState = {foo: 1};
              history1.push('/foo?a=1', consumerState);

              const state = window.history.state;
              const href = window.location.href;

              history1.push('/bar');

              unregisterListeners();
              createHistories();
              registerListeners();

              simulateOnPopState(state, href);

              expect(history1ListenerSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                  pathname: '/foo',
                  search: '?a=1',
                  state: consumerState
                }),
                'POP'
              );

              expect(history2ListenerSpy).not.toHaveBeenCalled();
            });
          });
        });
      });

      describe('#createHref()', () => {
        it('returns the href for the given location based on the root browser history', () => {
          history1.push('/foo');

          const location = {pathname: '/bar', search: '?a=b'};
          const href = history2.createHref(location);

          expect(href).toBe('/?test:1=/foo&test:2=/bar?a=b');
        });
      });

      describe('when the history consumer is destroyed', () => {
        it('removes the consumer path from the root location', () => {
          history1.push('/foo');
          history2.push('/bar');

          expect(window.location.href).toBe(
            'http://example.com/?test:1=/foo&test:2=/bar'
          );

          historyBinding1.unbind!();

          expect(window.location.href).toBe('http://example.com/?test:2=/bar');
        });

        it('does not call the listener of a destroyed consumer', () => {
          const history1ListenerSpy = jest.fn();
          const history2ListenerSpy = jest.fn();

          const history1Unregister = history1.listen(history1ListenerSpy);
          history2.listen(history2ListenerSpy);

          const state1 = window.history.state;
          const href1 = window.location.href;

          history1.push('/foo');

          const state2 = window.history.state;
          const href2 = window.location.href;

          history2.push('/bar');

          historyBinding2.unbind!();

          history1ListenerSpy.mockClear();
          history2ListenerSpy.mockClear();

          simulateOnPopState(state2, href2);

          expect(history2ListenerSpy).not.toHaveBeenCalled();

          simulateOnPopState(state1, href1);

          expect(history1ListenerSpy).toHaveBeenCalled();

          history1Unregister();
        });
      });
    });
  });
});
