// tslint:disable:no-implicit-dependencies
// tslint:disable:no-non-null-assertion

import {
  FeatureServiceBinder,
  FeatureServiceBinding,
  FeatureServiceEnvironment,
  FeatureServiceProviderDefinition,
} from '@feature-hub/core';
import {History} from 'history';
import {
  ConsumerLocationV3,
  HistoryServiceDependencies,
  HistoryServiceV1,
  HistoryServiceV2,
  HistoryServiceV3,
  RootLocation,
  SharedHistoryService,
  createRootLocationTransformer,
  defineHistoryService,
} from '..';
import * as historyV4 from '../history-v4';
import {ConsumerState} from '../internal/history-multiplexer';
import {Writable} from '../internal/writable';
import {
  consumerPathsQueryParamName,
  createSearch,
  createUrl,
} from './root-location-helpers';
import {stubbedLogger} from './stubbed-logger';

const simulateOnPopState = (state: unknown, url: string) => {
  // We need to use pushState to change to the URL that should be set by the popstate event.
  history.pushState(state, '', url);
  const popStateEvent = new PopStateEvent('popstate', {state});
  window.dispatchEvent(popStateEvent);
};

describe('defineHistoryService', () => {
  let pushStateSpy: jest.SpyInstance;
  let replaceStateSpy: jest.SpyInstance;

  let historyServiceDefinition: FeatureServiceProviderDefinition<SharedHistoryService>;

  beforeEach(() => {
    // ensure the window.location.href is the same before each test
    window.history.replaceState(null, '', 'http://example.com');

    pushStateSpy = jest.spyOn(window.history, 'pushState');
    replaceStateSpy = jest.spyOn(window.history, 'replaceState');

    historyServiceDefinition = defineHistoryService({
      createRootLocation: jest.fn(),
      getConsumerPathFromRootLocation: jest.fn(),
    });
  });

  afterEach(() => {
    pushStateSpy.mockRestore();
    replaceStateSpy.mockRestore();
  });

  it('creates a history service definition', () => {
    expect(historyServiceDefinition.id).toBe('s2:history');
    expect(historyServiceDefinition.dependencies).toBeUndefined();

    expect(historyServiceDefinition.optionalDependencies).toEqual({
      featureServices: {
        's2:logger': '^1.0.0',
        's2:server-request': '^1.0.0',
      },
    });
  });

  describe('#create', () => {
    it('creates a shared Feature Service containing versions 1.0.0 and 2.0.0', () => {
      const sharedHistoryService = historyServiceDefinition.create({
        featureServices: {},
      });

      expect(sharedHistoryService!['1.0.0']).toBeDefined();
      expect(sharedHistoryService!['2.0.0']).toBeDefined();
    });
  });

  describe('HistoryServiceV1', () => {
    let mockEnv: FeatureServiceEnvironment<Writable<
      HistoryServiceDependencies
    >>;

    let createHistoryServiceBinder: () => FeatureServiceBinder<
      HistoryServiceV1
    >;

    beforeEach(() => {
      mockEnv = {featureServices: {'s2:logger': stubbedLogger}};

      createHistoryServiceBinder = () => {
        const sharedHistoryService = defineHistoryService(
          createRootLocationTransformer({consumerPathsQueryParamName})
        ).create(mockEnv);

        return sharedHistoryService!['1.0.0'];
      };
    });

    describe('when the history service consumer is destroyed without having created a browser history', () => {
      it('does not try to unbind the non-existent browser history', () => {
        const historyServiceBinder = createHistoryServiceBinder();

        historyServiceBinder('test').unbind!();
      });
    });

    describe('#createBrowserHistory()', () => {
      let historyBinding1: FeatureServiceBinding<HistoryServiceV1>;
      let historyBinding2: FeatureServiceBinding<HistoryServiceV1>;
      let history1: historyV4.History;
      let history2: historyV4.History;

      const createHistories = () => {
        const historyServiceBinder = createHistoryServiceBinder();

        historyBinding1 = historyServiceBinder('test1');
        const historyService1 = historyBinding1.featureService;
        history1 = historyService1.createBrowserHistory();

        historyBinding2 = historyServiceBinder('test2');
        const historyService2 = historyBinding2.featureService;
        history2 = historyService2.createBrowserHistory();

        pushStateSpy.mockClear();
        replaceStateSpy.mockClear();
      };

      const destroyHistories = () => {
        historyBinding1.unbind!();
        historyBinding2.unbind!();
      };

      beforeEach(createHistories);
      afterEach(destroyHistories);

      describe('when called multiple times for the same consumer', () => {
        it('returns the same instance and logs a warning', () => {
          expect(historyBinding1.featureService.createBrowserHistory()).toEqual(
            history1
          );

          expect(stubbedLogger.warn).toHaveBeenCalledWith(
            'createBrowserHistory was called multiple times by consumer "test1". Returning the same history instance as before.'
          );
        });
      });

      describe('#length', () => {
        it('returns the same root history length for all consumers', () => {
          const initialLength = window.history.length;

          expect(history1.length).toBe(initialLength);
          expect(history2.length).toBe(initialLength);

          history1.push('/foo');
          history1.push('/bar');
          history1.replace('/qux');
          history2.push('/baz');
          history2.replace('/quux');

          expect(history1.length).toBe(initialLength + 3);
          expect(history2.length).toBe(initialLength + 3);
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
            state: {test: 'foo'},
          });

          expect(history2.location).toMatchObject({
            pathname: '/bar',
            state: {test: 'bar'},
          });
        });

        it('retrieves consumer specific locations from the initial location', () => {
          destroyHistories();

          const consumerStates: Record<string, ConsumerState> = {
            test1: {state: 'foo state', key: 'default'},
            test2: {state: 'bar state', key: 'default'},
          };

          const url = createUrl({test1: '/foo#some-anchor', test2: 'bar'});

          window.history.pushState({usr: consumerStates}, '', url);

          createHistories();

          expect(history1.location).toMatchObject({
            pathname: '/foo',
            state: 'foo state',
            hash: '#some-anchor',
            key: 'default',
          });

          expect(history2.location).toMatchObject({
            pathname: '/bar',
            state: 'bar state',
            key: 'default',
          });
        });

        describe('for a POP action', () => {
          it('updates the location of matching consumers', () => {
            const state = window.history.state;
            const href = window.location.href;

            history1.push('/foo');

            simulateOnPopState(state, href);

            expect(history1.location).toMatchObject({pathname: '/'});
          });
        });
      });

      describe('#push()', () => {
        it('pushes a new root location onto the root history for every consumer push', () => {
          history1.push('/foo');
          history2.push('/bar?baz=1');

          expect(window.location.href).toBe(
            createUrl({test1: '/foo', test2: '/bar?baz=1'})
          );

          expect(pushStateSpy).toHaveBeenCalledTimes(2);
        });

        it('accepts state as part of the location descriptor object', () => {
          history1.push({pathname: '/foo', state: 1});

          expect(history1.location.state).toBe(1);
        });

        it('accepts state as the second argument', () => {
          history1.push('/foo', 1);

          expect(history1.location.state).toBe(1);
        });

        it('normalizes the pathname', () => {
          history1.push('foo');

          expect(window.location.href).toBe(createUrl({test1: '/foo'}));
        });

        it('handles relative pathnames', () => {
          history1.push('/foo/bar');
          history1.push('baz');

          expect(window.location.href).toBe(createUrl({test1: '/foo/baz'}));
        });
      });

      describe('#replace()', () => {
        it('replaces the root location in the root history for every consumer replace', () => {
          history1.replace('/foo');
          history2.replace('/bar?baz=1');

          expect(window.location.href).toBe(
            createUrl({test1: '/foo', test2: '/bar?baz=1'})
          );

          expect(replaceStateSpy).toHaveBeenCalledTimes(2);
        });

        it('accepts state as part of the location descriptor object', () => {
          history1.replace({pathname: '/foo', state: 1});

          expect(history1.location.state).toBe(1);
        });

        it('accepts state as the second argument', () => {
          history1.replace('/foo', 1);

          expect(history1.location.state).toBe(1);
        });

        it('normalizes the pathname', () => {
          history1.replace('foo');

          expect(window.location.href).toBe(createUrl({test1: '/foo'}));
        });

        it('handles relative pathnames', () => {
          history1.replace('/foo/bar');
          history1.replace('baz');

          expect(window.location.href).toBe(createUrl({test1: '/foo/baz'}));
        });
      });

      describe('#go()', () => {
        it('does nothing and logs a warning that go() is not supported', () => {
          history1.push('/foo');

          const href = window.location.href;

          history1.go(-1);

          expect(window.location.href).toBe(href);

          expect(stubbedLogger.warn).toHaveBeenCalledWith(
            'history.go() is not supported.'
          );
        });
      });

      describe('#goBack()', () => {
        it('does nothing and logs a warning that goBack() is not supported', () => {
          history1.push('/foo');

          const href = window.location.href;

          history1.goBack();

          expect(window.location.href).toBe(href);

          expect(stubbedLogger.warn).toHaveBeenCalledWith(
            'history.goBack() is not supported.'
          );
        });
      });

      describe('#goForward()', () => {
        it('does nothing and logs a warning that goForward() is not supported', () => {
          history1.push('/foo');

          const href = window.location.href;

          history1.goForward();

          expect(window.location.href).toBe(href);

          expect(stubbedLogger.warn).toHaveBeenCalledWith(
            'history.goForward() is not supported.'
          );
        });
      });

      describe('#block()', () => {
        it('does nothing and logs a warning', () => {
          const promptHookSpy = jest.fn();

          history1.block(promptHookSpy);
          history1.push('/foo?bar=1');

          expect(window.location.href).toBe(createUrl({test1: '/foo?bar=1'}));

          expect(promptHookSpy).not.toHaveBeenCalled();

          expect(stubbedLogger.warn).toHaveBeenCalledWith(
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

          it('updates the location of matching consumers even when not listening', () => {
            const state = window.history.state;
            const href = window.location.href;

            history1.push('/foo');
            unregisterListeners();

            simulateOnPopState(state, href);

            expect(history1.location).toMatchObject({pathname: '/'});
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
                  state: consumerState,
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

          expect(href).toBe(
            createUrl({test1: '/foo', test2: '/bar?a=b'}, {relative: true})
          );
        });

        it('normalizes the pathname', () => {
          history1.push('/foo');

          const location = {pathname: 'bar'};
          const href = history2.createHref(location);

          expect(href).toBe(
            createUrl({test1: '/foo', test2: '/bar'}, {relative: true})
          );
        });
      });

      describe('when the history consumer is destroyed', () => {
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

        describe('for a POP action', () => {
          it('does not update the location of a destroyed consumer', () => {
            const state = window.history.state;
            const href = window.location.href;

            history1.push('/foo');
            historyBinding1.unbind!();

            simulateOnPopState(state, href);

            expect(history1.location).toMatchObject({pathname: '/foo'});
          });
        });
      });
    });

    describe('when no Logger Feature Service is provided', () => {
      let consoleWarnSpy: jest.SpyInstance;

      beforeEach(() => {
        consoleWarnSpy = jest.spyOn(console, 'warn');
        mockEnv.featureServices['s2:logger'] = undefined;
      });

      afterEach(() => {
        consoleWarnSpy.mockRestore();
      });

      it('logs messages using the console', () => {
        const historyServiceBinder = createHistoryServiceBinder();
        const historyService = historyServiceBinder('test1').featureService;
        const browserHistory = historyService.createBrowserHistory();

        browserHistory.go(-1);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'history.go() is not supported.'
        );
      });
    });
  });

  describe('HistoryServiceV2', () => {
    let mockEnv: FeatureServiceEnvironment<Writable<
      HistoryServiceDependencies
    >>;

    let createHistoryServiceBinder: (
      mode?: 'browser' | 'static'
    ) => FeatureServiceBinder<HistoryServiceV2>;

    beforeEach(() => {
      mockEnv = {
        featureServices: {'s2:logger': stubbedLogger},
      };

      createHistoryServiceBinder = () => {
        const sharedHistoryService = defineHistoryService(
          createRootLocationTransformer({consumerPathsQueryParamName})
        ).create(mockEnv);

        return sharedHistoryService!['2.0.0'];
      };
    });

    describe('#historyKey', () => {
      it('uses the consumer ID as history key', () => {
        const consumerId = 'test1';
        const historyServiceBinder = createHistoryServiceBinder();
        const historyBinding1 = historyServiceBinder(consumerId);
        const {historyKey} = historyBinding1.featureService;

        expect(historyKey).toBe(consumerId);
      });
    });

    describe('#history', () => {
      let historyBinding1: FeatureServiceBinding<HistoryServiceV2>;
      let historyBinding2: FeatureServiceBinding<HistoryServiceV2>;
      let history1: historyV4.History;
      let history2: historyV4.History;

      const createHistories = () => {
        const historyServiceBinder = createHistoryServiceBinder();

        historyBinding1 = historyServiceBinder('test1');
        const historyService1 = historyBinding1.featureService;
        history1 = historyService1.history;

        historyBinding2 = historyServiceBinder('test2');
        const historyService2 = historyBinding2.featureService;
        history2 = historyService2.history;

        pushStateSpy.mockClear();
        replaceStateSpy.mockClear();
      };

      const destroyHistories = () => {
        historyBinding1.unbind!();
        historyBinding2.unbind!();
      };

      beforeEach(createHistories);
      afterEach(destroyHistories);

      describe('#length', () => {
        it('returns the same root history length for all consumers', () => {
          const initialLength = window.history.length;

          expect(history1.length).toBe(initialLength);
          expect(history2.length).toBe(initialLength);

          history1.push('/foo');
          history1.push('/bar');
          history1.replace('/qux');
          history2.push('/baz');
          history2.replace('/quux');

          expect(history1.length).toBe(initialLength + 3);
          expect(history2.length).toBe(initialLength + 3);
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
            state: {test: 'foo'},
          });

          expect(history2.location).toMatchObject({
            pathname: '/bar',
            state: {test: 'bar'},
          });
        });

        it('retrieves consumer specific locations from the initial location', () => {
          destroyHistories();

          const consumerStates: Record<string, ConsumerState> = {
            test1: {state: 'foo state', key: 'default'},
            test2: {state: 'bar state', key: 'default'},
          };

          const url = createUrl({test1: '/foo', test2: 'bar'});

          window.history.pushState({usr: consumerStates}, '', url);

          createHistories();

          expect(history1.location).toMatchObject({
            pathname: '/foo',
            state: 'foo state',
            key: 'default',
          });

          expect(history2.location).toMatchObject({
            pathname: '/bar',
            state: 'bar state',
            key: 'default',
          });
        });

        describe('when getConsumerPathFromRootLocation returns undefined', () => {
          it('returns the default location', () => {
            expect(history1.location).toMatchObject({
              pathname: '/',
              search: '',
            });
          });
        });

        describe('for a POP action', () => {
          it('updates the location of matching consumers', () => {
            const state = window.history.state;
            const href = window.location.href;

            history1.push('/foo');

            simulateOnPopState(state, href);

            expect(history1.location).toMatchObject({pathname: '/'});
          });
        });
      });

      describe('#push()', () => {
        it('pushes a new root location onto the root history for every consumer push', () => {
          history1.push('/foo');
          history2.push('/bar?baz=1');

          expect(window.location.href).toBe(
            createUrl({test1: '/foo', test2: '/bar?baz=1'})
          );

          expect(pushStateSpy).toHaveBeenCalledTimes(2);
        });

        it('normalizes the pathname', () => {
          history1.push('foo');

          expect(window.location.href).toBe(createUrl({test1: '/foo'}));
        });

        it('handles relative pathnames', () => {
          history1.push('/foo/bar');
          history1.push('baz');

          expect(window.location.href).toBe(createUrl({test1: '/foo/baz'}));
        });
      });

      describe('#replace()', () => {
        it('replaces the root location in the root history for every consumer replace', () => {
          history1.replace('/foo');
          history2.replace('/bar?baz=1');

          expect(window.location.href).toBe(
            createUrl({test1: '/foo', test2: '/bar?baz=1'})
          );

          expect(replaceStateSpy).toHaveBeenCalledTimes(2);
        });

        it('normalizes the pathname', () => {
          history1.replace('foo');

          expect(window.location.href).toBe(createUrl({test1: '/foo'}));
        });

        it('handles relative pathnames', () => {
          history1.replace('/foo/bar');
          history1.replace('baz');

          expect(window.location.href).toBe(createUrl({test1: '/foo/baz'}));
        });
      });

      describe('#go()', () => {
        it('does nothing and logs a warning that go() is not supported', () => {
          history1.push('/foo');

          const href = window.location.href;

          history1.go(-1);

          expect(window.location.href).toBe(href);

          expect(stubbedLogger.warn).toHaveBeenCalledWith(
            'history.go() is not supported.'
          );
        });
      });

      describe('#goBack()', () => {
        it('does nothing and logs a warning that goBack() is not supported', () => {
          history1.push('/foo');

          const href = window.location.href;

          history1.goBack();

          expect(window.location.href).toBe(href);

          expect(stubbedLogger.warn).toHaveBeenCalledWith(
            'history.goBack() is not supported.'
          );
        });
      });

      describe('#goForward()', () => {
        it('does nothing and logs a warning that goForward() is not supported', () => {
          history1.push('/foo');

          const href = window.location.href;

          history1.goForward();

          expect(window.location.href).toBe(href);

          expect(stubbedLogger.warn).toHaveBeenCalledWith(
            'history.goForward() is not supported.'
          );
        });
      });

      describe('#block()', () => {
        it('does nothing and logs a warning', () => {
          const promptHookSpy = jest.fn();

          history1.block(promptHookSpy);
          history1.push('/foo?bar=1');

          expect(window.location.href).toBe(createUrl({test1: '/foo?bar=1'}));

          expect(promptHookSpy).not.toHaveBeenCalled();

          expect(stubbedLogger.warn).toHaveBeenCalledWith(
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

          it('updates the location of matching consumers even when not listening', () => {
            const state = window.history.state;
            const href = window.location.href;

            history1.push('/foo');
            unregisterListeners();

            simulateOnPopState(state, href);

            expect(history1.location).toMatchObject({pathname: '/'});
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
                  state: consumerState,
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

          expect(href).toBe(
            createUrl({test1: '/foo', test2: '/bar?a=b'}, {relative: true})
          );
        });

        it('normalizes the pathname', () => {
          history1.push('/foo');

          const location = {pathname: 'bar'};
          const href = history2.createHref(location);

          expect(href).toBe(
            createUrl({test1: '/foo', test2: '/bar'}, {relative: true})
          );
        });
      });

      describe('when the history consumer is destroyed', () => {
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

        describe('for a POP action', () => {
          it('does not update the location of a destroyed consumer', () => {
            const state = window.history.state;
            const href = window.location.href;

            history1.push('/foo');
            historyBinding1.unbind!();

            simulateOnPopState(state, href);

            expect(history1.location).toMatchObject({pathname: '/foo'});
          });
        });
      });
    });

    describe('#rootHistory', () => {
      let historyBinding1: FeatureServiceBinding<HistoryServiceV2>;
      let historyBinding2: FeatureServiceBinding<HistoryServiceV2>;
      let historyService1: HistoryServiceV2;
      let historyService2: HistoryServiceV2;

      const createHistories = () => {
        const historyServiceBinder = createHistoryServiceBinder();

        historyBinding1 = historyServiceBinder('test1');
        historyService1 = historyBinding1.featureService;

        historyBinding2 = historyServiceBinder('test2');
        historyService2 = historyBinding2.featureService;

        pushStateSpy.mockClear();
        replaceStateSpy.mockClear();
      };

      beforeEach(createHistories);

      it('is the same instance for every consumer', () => {
        expect(historyService1.rootHistory).toBe(historyService2.rootHistory);
      });

      describe('#length', () => {
        it('returns the window history length', () => {
          const initialLength = window.history.length;

          expect(historyService1.rootHistory.length).toBe(initialLength);

          historyService1.history.push('/foo');
          historyService1.history.push('/bar');
          historyService1.history.replace('/qux');
          historyService2.history.push('/baz');
          historyService2.history.replace('/quux');

          expect(historyService1.rootHistory.length).toBe(initialLength + 3);
        });
      });

      describe('#location', () => {
        it('returns the root location containing all consumer locations', () => {
          historyService1.history.push('/foo', {test: 'foo'});
          historyService2.history.replace('/bar', {test: 'bar'});

          expect(historyService1.rootHistory.location).toMatchObject({
            pathname: '/',
            search: createSearch({test1: '/foo', test2: '/bar'}),
            state: {
              test1: {state: {test: 'foo'}, key: expect.any(String)},
              test2: {state: {test: 'bar'}, key: expect.any(String)},
            },
          });
        });

        it('returns a root location containing all consumer locations from the initial window location', () => {
          const consumerStates = {test1: 'foo state', test2: 'bar state'};
          const url = createUrl({test1: '/foo', test2: 'bar'});

          window.history.pushState({usr: consumerStates}, '', url);

          createHistories();

          expect(historyService1.rootHistory.location).toMatchObject({
            pathname: '/',
            search: createSearch({test1: '/foo', test2: 'bar'}),
            state: consumerStates,
          });
        });

        describe('for a POP action', () => {
          it('returns the previous root location', () => {
            historyService1.history.push('/foo');

            const state = window.history.state;
            const href = window.location.href;

            historyService2.history.push('/bar');

            simulateOnPopState(state, href);

            expect(historyService1.rootHistory.location).toMatchObject({
              pathname: '/',
              search: createSearch({test1: '/foo'}),
              state: state.usr,
            });
          });
        });
      });

      describe('#push()', () => {
        it('pushes a new root location onto the root history', () => {
          historyService1.rootHistory.push({pathname: '/foo'});

          expect(window.location.href).toBe('http://example.com/foo');
          expect(pushStateSpy).toHaveBeenCalledTimes(1);
        });

        it('puts state into the root location', () => {
          historyService1.rootHistory.push({pathname: '/foo', state: {foo: 1}});

          expect(historyService1.rootHistory.location).toMatchObject({
            pathname: '/foo',
            state: {foo: 1},
          });
        });

        it('normalizes the pathname', () => {
          historyService1.rootHistory.push({pathname: 'foo'});

          expect(window.location.href).toBe('http://example.com/foo');
        });

        it('handles relative pathnames', () => {
          historyService1.rootHistory.push({pathname: '/foo/bar'});
          historyService1.rootHistory.push({pathname: 'baz'});

          expect(window.location.href).toBe('http://example.com/foo/baz');
        });

        it('changes the location and action of affected consumer histories', () => {
          const rootLocation = historyService1.createNewRootLocationForMultipleConsumers(
            {historyKey: 'test2', location: {pathname: '/test2'}}
          );

          historyService1.rootHistory.push(rootLocation);

          expect(historyService1.history.location).toMatchObject({
            pathname: '/',
          });

          expect(historyService1.history.action).toBe('POP');

          expect(historyService2.history.location).toMatchObject({
            pathname: '/test2',
          });

          expect(historyService2.history.action).toBe('PUSH');
        });

        it('notifies affected consumer history listeners', () => {
          const listener1 = jest.fn();
          const listener2 = jest.fn();

          historyService1.history.push('/foo');

          historyService1.history.listen(listener1);
          historyService2.history.listen(listener2);

          const rootLocation = historyService1.createNewRootLocationForMultipleConsumers(
            {historyKey: 'test2', location: {pathname: '/test2'}}
          );

          historyService1.rootHistory.push(rootLocation);

          expect(listener1.mock.calls).toEqual([
            [
              {
                pathname: '/',
                search: '',
                hash: '',
                state: undefined,
                key: expect.any(String),
              },
              'PUSH',
            ],
          ]);

          expect(listener2.mock.calls).toMatchObject([
            [
              {
                pathname: '/test2',
                search: '',
                hash: '',
                state: undefined,
                key: expect.any(String),
              },
              'PUSH',
            ],
          ]);
        });
      });

      describe('#replace()', () => {
        it('replaces a new root location onto the root history', () => {
          historyService1.rootHistory.replace({pathname: '/foo'});

          expect(window.location.href).toBe('http://example.com/foo');
          expect(replaceStateSpy).toHaveBeenCalledTimes(1);
        });

        it('puts state into the root location', () => {
          historyService1.rootHistory.replace({
            pathname: '/foo',
            state: {foo: 1},
          });

          expect(historyService1.rootHistory.location).toMatchObject({
            pathname: '/foo',
            state: {foo: 1},
          });
        });

        it('normalizes the pathname', () => {
          historyService1.rootHistory.replace({pathname: 'foo'});

          expect(window.location.href).toBe('http://example.com/foo');
        });

        it('handles relative pathnames', () => {
          historyService1.rootHistory.replace({
            pathname: '/foo/bar',
          });

          historyService1.rootHistory.replace({pathname: 'baz'});

          expect(window.location.href).toBe('http://example.com/foo/baz');
        });

        it('changes the location and action of affected consumer histories', () => {
          const rootLocation = historyService1.createNewRootLocationForMultipleConsumers(
            {historyKey: 'test2', location: {pathname: '/test2'}}
          );

          historyService1.rootHistory.replace(rootLocation);

          expect(historyService1.history.location).toMatchObject({
            pathname: '/',
          });

          expect(historyService1.history.action).toBe('POP');

          expect(historyService2.history.location).toMatchObject({
            pathname: '/test2',
          });

          expect(historyService2.history.action).toBe('REPLACE');
        });

        it('notifies affected consumer history listeners', () => {
          const listener1 = jest.fn();
          const listener2 = jest.fn();

          historyService1.history.listen(listener1);
          historyService2.history.listen(listener2);

          const rootLocation = historyService1.createNewRootLocationForMultipleConsumers(
            {historyKey: 'test2', location: {pathname: '/test2'}}
          );

          historyService1.rootHistory.replace(rootLocation);

          expect(listener1).not.toHaveBeenCalled();
          expect(listener2).toHaveBeenCalledTimes(1);
        });
      });

      describe('#listen()', () => {
        it('calls listeners for consumer history changes', () => {
          const listenerSpy = jest.fn();

          historyService1.rootHistory.listen(listenerSpy);
          historyService1.history.push('/bar');

          expect(listenerSpy.mock.calls).toMatchObject([
            [
              {
                pathname: '/',
                search: createSearch({test1: '/bar'}),
                state: {test1: {state: undefined, key: expect.any(String)}},
              },
              'PUSH',
            ],
          ]);
        });

        it('calls listeners for root history changes', () => {
          const listenerSpy = jest.fn();

          historyService1.rootHistory.listen(listenerSpy);
          historyService1.rootHistory.push({pathname: '/foo'});

          expect(listenerSpy.mock.calls).toEqual([
            [expect.objectContaining({pathname: '/foo'}), 'PUSH'],
          ]);
        });

        it('returns an unregister function', () => {
          const listenerSpy = jest.fn();
          const unregister = historyService1.rootHistory.listen(listenerSpy);

          historyService1.rootHistory.push({pathname: '/foo'});
          unregister();
          historyService1.rootHistory.push({pathname: '/bar'});

          expect(listenerSpy).toHaveBeenCalledTimes(1);
        });

        describe('for a POP action', () => {
          it('calls listeners with a POP event', () => {
            const listenerSpy = jest.fn();
            const state = window.history.state;
            const href = window.location.href;

            historyService1.history.push('/foo');
            historyService1.rootHistory.listen(listenerSpy);

            simulateOnPopState(state, href);

            expect(listenerSpy).toHaveBeenCalledWith(
              expect.objectContaining({pathname: '/'}),
              'POP'
            );
          });
        });
      });

      describe('#createHref()', () => {
        it('returns the href for the given root location', () => {
          historyService1.rootHistory.push({pathname: '/foo'});

          const location = {pathname: '/bar', search: '?a=b'};
          const href = historyService1.rootHistory.createHref(location);

          expect(href).toBe('/bar?a=b');
        });
      });
    });

    describe('#createNewRootLocationForMultipleConsumers', () => {
      it('creates a new root location for a single consumer', () => {
        const historyServiceBinder = createHistoryServiceBinder();
        const historyService = historyServiceBinder('test1').featureService;

        const location = historyService.createNewRootLocationForMultipleConsumers(
          {historyKey: 'test1', location: {pathname: '/test1', state: 42}}
        );

        expect(location).toMatchObject({
          pathname: '/',
          search: createSearch({test1: '/test1'}),
          state: {test1: {state: 42, key: expect.any(String)}},
        });
      });

      it('creates a new root location for two consumers', () => {
        const historyServiceBinder = createHistoryServiceBinder();
        const historyService = historyServiceBinder('test1').featureService;

        const location = historyService.createNewRootLocationForMultipleConsumers(
          {
            historyKey: 'test1',
            location: {pathname: '/test', state: 42},
          },
          {
            historyKey: 'test2',
            location: {pathname: '/xxx', state: 'foo'},
          }
        );

        expect(location).toMatchObject({
          pathname: '/',
          search: createSearch({test1: '/test', test2: '/xxx'}),
          state: {
            test1: {state: 42, key: expect.any(String)},
            test2: {state: 'foo', key: expect.any(String)},
          },
        });
      });

      describe('with a createNewRootLocationForMultipleConsumers method defined in the root location transformer', () => {
        let createNewRootLocationForMultipleConsumersMock: jest.Mock;
        let historyServiceTest1: HistoryServiceV2;

        beforeEach(() => {
          createNewRootLocationForMultipleConsumersMock = jest.fn(() => ({
            pathname: 'root-test',
          }));

          createHistoryServiceBinder = () => {
            const sharedHistoryService = defineHistoryService({
              createRootLocation: jest.fn(),
              getConsumerPathFromRootLocation: jest.fn(),
              createNewRootLocationForMultipleConsumers: createNewRootLocationForMultipleConsumersMock,
            }).create(mockEnv);

            return sharedHistoryService!['2.0.0'];
          };

          const historyServiceBinder = createHistoryServiceBinder();
          historyServiceTest1 = historyServiceBinder('test1').featureService;
        });

        it('uses the custom createNewRootLocationForMultipleConsumers method', () => {
          const consumerLocation = {
            historyKey: 'test1',
            location: {pathname: '/test1'},
          };

          historyServiceTest1.createNewRootLocationForMultipleConsumers(
            consumerLocation
          );

          expect(
            createNewRootLocationForMultipleConsumersMock.mock.calls
          ).toEqual([[consumerLocation]]);
        });

        it('sets the consumer states on the new root location', () => {
          const consumerLocation = {
            historyKey: 'test1',
            location: {pathname: '/test1', state: 42},
          };

          const location = historyServiceTest1.createNewRootLocationForMultipleConsumers(
            consumerLocation
          );

          const expectedRootLocation: RootLocation = {
            pathname: 'root-test',
            search: '',
            hash: '',
            state: {
              test1: {state: 42, key: expect.any(String)},
            },
          };

          expect(location).toMatchObject(expectedRootLocation);
        });
      });
    });

    describe('when no Logger Feature Service is provided', () => {
      let consoleWarnSpy: jest.SpyInstance;

      beforeEach(() => {
        consoleWarnSpy = jest.spyOn(console, 'warn');
        mockEnv.featureServices['s2:logger'] = undefined;
      });

      afterEach(() => {
        consoleWarnSpy.mockRestore();
      });

      it('logs messages using the console', () => {
        const historyServiceBinder = createHistoryServiceBinder();
        const historyService = historyServiceBinder('test1').featureService;
        const browserHistory = historyService.history;

        browserHistory.go(-1);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'history.go() is not supported.'
        );
      });
    });
  });

  describe('HistoryServiceV3', () => {
    let mockEnv: FeatureServiceEnvironment<Writable<
      HistoryServiceDependencies
    >>;

    let createHistoryServiceBinder: (
      mode?: 'browser' | 'static'
    ) => FeatureServiceBinder<HistoryServiceV3>;

    beforeEach(() => {
      mockEnv = {
        featureServices: {'s2:logger': stubbedLogger},
      };

      createHistoryServiceBinder = () => {
        const sharedHistoryService = defineHistoryService(
          createRootLocationTransformer({consumerPathsQueryParamName})
        ).create(mockEnv);

        return sharedHistoryService!['3.0.0'];
      };
    });

    describe('#historyKey', () => {
      it('uses the consumer ID as history key', () => {
        const consumerId = 'test1';
        const historyServiceBinder = createHistoryServiceBinder();
        const historyBinding1 = historyServiceBinder(consumerId);
        const {historyKey} = historyBinding1.featureService;

        expect(historyKey).toBe(consumerId);
      });
    });

    describe('#history', () => {
      let historyBinding1: FeatureServiceBinding<HistoryServiceV3>;
      let historyBinding2: FeatureServiceBinding<HistoryServiceV3>;
      let history1: History;
      let history2: History;

      const createHistories = () => {
        const historyServiceBinder = createHistoryServiceBinder();

        historyBinding1 = historyServiceBinder('test1');
        const historyService1 = historyBinding1.featureService;
        history1 = historyService1.history;

        historyBinding2 = historyServiceBinder('test2');
        const historyService2 = historyBinding2.featureService;
        history2 = historyService2.history;

        pushStateSpy.mockClear();
        replaceStateSpy.mockClear();
      };

      const destroyHistories = () => {
        historyBinding1.unbind!();
        historyBinding2.unbind!();
      };

      beforeEach(createHistories);
      afterEach(destroyHistories);

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
            state: {test: 'foo'},
          });

          expect(history2.location).toMatchObject({
            pathname: '/bar',
            state: {test: 'bar'},
          });
        });

        it('retrieves consumer specific locations from the initial location', () => {
          destroyHistories();

          const consumerStates: Record<string, ConsumerState> = {
            test1: {state: 'foo state', key: 'default'},
            test2: {state: 'bar state', key: 'default'},
          };

          const url = createUrl({test1: '/foo', test2: 'bar'});

          window.history.pushState({usr: consumerStates}, '', url);

          createHistories();

          expect(history1.location).toMatchObject({
            pathname: '/foo',
            state: 'foo state',
            key: 'default',
          });

          expect(history2.location).toMatchObject({
            pathname: '/bar',
            state: 'bar state',
            key: 'default',
          });
        });

        describe('when getConsumerPathFromRootLocation returns undefined', () => {
          it('returns the default location', () => {
            expect(history1.location).toMatchObject({
              pathname: '/',
              search: '',
            });
          });
        });

        describe('for a POP action', () => {
          it('updates the location of matching consumers', () => {
            const state = window.history.state;
            const href = window.location.href;

            history1.push('/foo');

            simulateOnPopState(state, href);

            expect(history1.location).toMatchObject({pathname: '/'});
          });
        });
      });

      describe('#push()', () => {
        it('pushes a new root location onto the root history for every consumer push', () => {
          history1.push('/foo');
          history2.push('/bar?baz=1');

          expect(window.location.href).toBe(
            createUrl({test1: '/foo', test2: '/bar?baz=1'})
          );

          expect(pushStateSpy).toHaveBeenCalledTimes(2);
        });

        it('normalizes the pathname', () => {
          history1.push('foo');

          expect(window.location.href).toBe(createUrl({test1: '/foo'}));
        });

        it('handles relative pathnames', () => {
          history1.push('/foo/bar');
          history1.push('baz');

          expect(window.location.href).toBe(createUrl({test1: '/foo/baz'}));
        });
      });

      describe('#replace()', () => {
        it('replaces the root location in the root history for every consumer replace', () => {
          history1.replace('/foo');
          history2.replace('/bar?baz=1');

          expect(window.location.href).toBe(
            createUrl({test1: '/foo', test2: '/bar?baz=1'})
          );

          expect(replaceStateSpy).toHaveBeenCalledTimes(2);
        });

        it('normalizes the pathname', () => {
          history1.replace('foo');

          expect(window.location.href).toBe(createUrl({test1: '/foo'}));
        });

        it('handles relative pathnames', () => {
          history1.replace('/foo/bar');
          history1.replace('baz');

          expect(window.location.href).toBe(createUrl({test1: '/foo/baz'}));
        });
      });

      describe('#go()', () => {
        it('does nothing and logs a warning that go() is not supported', () => {
          history1.push('/foo');

          const href = window.location.href;

          history1.go(-1);

          expect(window.location.href).toBe(href);

          expect(stubbedLogger.warn).toHaveBeenCalledWith(
            'history.go() is not supported.'
          );
        });
      });

      describe('#back()', () => {
        it('does nothing and logs a warning that back() is not supported', () => {
          history1.push('/foo');

          const href = window.location.href;

          history1.back();

          expect(window.location.href).toBe(href);

          expect(stubbedLogger.warn).toHaveBeenCalledWith(
            'history.back() is not supported.'
          );
        });
      });

      describe('#forward()', () => {
        it('does nothing and logs a warning that forward() is not supported', () => {
          history1.push('/foo');

          const href = window.location.href;

          history1.forward();

          expect(window.location.href).toBe(href);

          expect(stubbedLogger.warn).toHaveBeenCalledWith(
            'history.forward() is not supported.'
          );
        });
      });

      describe('#block()', () => {
        it('does nothing and logs a warning', () => {
          const promptHookSpy = jest.fn();

          history1.block(promptHookSpy);
          history1.push('/foo?bar=1');

          expect(window.location.href).toBe(createUrl({test1: '/foo?bar=1'}));

          expect(promptHookSpy).not.toHaveBeenCalled();

          expect(stubbedLogger.warn).toHaveBeenCalledWith(
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

          expect(listenerSpy1).toHaveBeenCalledWith({
            location: expect.objectContaining({
              pathname: '/foo',
              search: '?bar=1',
            }),
            action: 'PUSH',
          });

          expect(listenerSpy2).toHaveBeenCalledTimes(1);

          expect(listenerSpy2).toHaveBeenCalledWith({
            location: expect.objectContaining({
              pathname: '/baz',
              search: '?qux=2',
            }),
            action: 'REPLACE',
          });
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

            expect(history1ListenerSpy).toHaveBeenCalledWith({
              location: expect.objectContaining({pathname: '/'}),
              action: 'POP',
            });

            expect(history2ListenerSpy).not.toHaveBeenCalled();
          });

          it('updates the location of matching consumers even when not listening', () => {
            const state = window.history.state;
            const href = window.location.href;

            history1.push('/foo');
            unregisterListeners();

            simulateOnPopState(state, href);

            expect(history1.location).toMatchObject({pathname: '/'});
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

              expect(history1ListenerSpy).toHaveBeenCalledWith({
                location: expect.objectContaining({
                  pathname: '/baz',
                  search: '?qux=3',
                }),
                action: 'POP',
              });

              history1ListenerSpy.mockClear();

              simulateOnPopState(state2, href2); // POP foward

              expect(history1ListenerSpy).toHaveBeenCalledWith({
                location: expect.objectContaining({
                  pathname: '/bar',
                  search: '?qux=4',
                }),
                action: 'POP',
              });
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

              expect(history2ListenerSpy).toHaveBeenCalledWith({
                location: expect.objectContaining({pathname: '/b2'}),
                action: 'POP',
              });
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

              expect(history1ListenerSpy).toHaveBeenCalledWith({
                location: expect.objectContaining({
                  pathname: '/foo',
                  search: '?a=1',
                  state: consumerState,
                }),
                action: 'POP',
              });

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

          expect(href).toBe(
            createUrl({test1: '/foo', test2: '/bar?a=b'}, {relative: true})
          );
        });

        it('normalizes the pathname', () => {
          history1.push('/foo');

          const location = {pathname: 'bar'};
          const href = history2.createHref(location);

          expect(href).toBe(
            createUrl({test1: '/foo', test2: '/bar'}, {relative: true})
          );
        });
      });

      describe('when the history consumer is destroyed', () => {
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

        describe('for a POP action', () => {
          it('does not update the location of a destroyed consumer', () => {
            const state = window.history.state;
            const href = window.location.href;

            history1.push('/foo');
            historyBinding1.unbind!();

            simulateOnPopState(state, href);

            expect(history1.location).toMatchObject({pathname: '/foo'});
          });
        });
      });
    });

    describe('#rootHistory', () => {
      let historyBinding1: FeatureServiceBinding<HistoryServiceV3>;
      let historyBinding2: FeatureServiceBinding<HistoryServiceV3>;
      let historyService1: HistoryServiceV3;
      let historyService2: HistoryServiceV3;

      const createHistories = () => {
        const historyServiceBinder = createHistoryServiceBinder();

        historyBinding1 = historyServiceBinder('test1');
        historyService1 = historyBinding1.featureService;

        historyBinding2 = historyServiceBinder('test2');
        historyService2 = historyBinding2.featureService;

        pushStateSpy.mockClear();
        replaceStateSpy.mockClear();
      };

      beforeEach(createHistories);

      it('is the same instance for every consumer', () => {
        expect(historyService1.rootHistory).toBe(historyService2.rootHistory);
      });

      describe('#location', () => {
        it('returns the root location containing all consumer locations', () => {
          historyService1.history.push('/foo', {test: 'foo'});
          historyService2.history.replace('/bar', {test: 'bar'});

          expect(historyService1.rootHistory.location).toMatchObject({
            pathname: '/',
            search: createSearch({test1: '/foo', test2: '/bar'}),
            state: {
              test1: {state: {test: 'foo'}, key: expect.any(String)},
              test2: {state: {test: 'bar'}, key: expect.any(String)},
            },
          });
        });

        it('returns a root location containing all consumer locations from the initial window location', () => {
          const consumerStates = {test1: 'foo state', test2: 'bar state'};
          const url = createUrl({test1: '/foo', test2: 'bar'});

          window.history.pushState({usr: consumerStates}, '', url);

          createHistories();

          expect(historyService1.rootHistory.location).toMatchObject({
            pathname: '/',
            search: createSearch({test1: '/foo', test2: 'bar'}),
            state: consumerStates,
          });
        });

        describe('for a POP action', () => {
          it('returns the previous root location', () => {
            historyService1.history.push('/foo');

            const state = window.history.state;
            const href = window.location.href;

            historyService2.history.push('/bar');

            simulateOnPopState(state, href);

            expect(historyService1.rootHistory.location).toMatchObject({
              pathname: '/',
              search: createSearch({test1: '/foo'}),
              state: state.usr,
            });
          });
        });
      });

      describe('#push()', () => {
        it('pushes a new root location onto the root history', () => {
          historyService1.rootHistory.push({pathname: '/foo'});

          expect(window.location.href).toBe('http://example.com/foo');
          expect(pushStateSpy).toHaveBeenCalledTimes(1);
        });

        it('puts state into the root location', () => {
          historyService1.rootHistory.push({pathname: '/foo'}, {foo: 1});

          expect(historyService1.rootHistory.location).toMatchObject({
            pathname: '/foo',
            state: {foo: 1},
          });
        });

        it('normalizes the pathname', () => {
          historyService1.rootHistory.push({pathname: 'foo'});

          expect(window.location.href).toBe('http://example.com/foo');
        });

        it('handles relative pathnames', () => {
          historyService1.rootHistory.push({pathname: '/foo/bar'});
          historyService1.rootHistory.push({pathname: 'baz'});

          expect(window.location.href).toBe('http://example.com/foo/baz');
        });

        it('changes the location and action of affected consumer histories', () => {
          const {
            state,
            ...to
          } = historyService1.createNewRootLocationForMultipleConsumers({
            historyKey: 'test2',
            location: {pathname: '/test2'},
          });

          historyService1.rootHistory.push(to, state);

          expect(historyService1.history.location).toMatchObject({
            pathname: '/',
          });

          expect(historyService1.history.action).toBe('POP');

          expect(historyService2.history.location).toMatchObject({
            pathname: '/test2',
          });

          expect(historyService2.history.action).toBe('PUSH');
        });

        it('notifies affected consumer history listeners', () => {
          const listener1 = jest.fn();
          const listener2 = jest.fn();

          historyService1.history.push('/foo');

          historyService1.history.listen(listener1);
          historyService2.history.listen(listener2);

          const {
            state,
            ...to
          } = historyService1.createNewRootLocationForMultipleConsumers({
            historyKey: 'test2',
            location: {pathname: '/test2'},
          });

          historyService1.rootHistory.push(to, state);

          expect(listener1.mock.calls).toEqual([
            [
              {
                location: {
                  pathname: '/',
                  search: '',
                  hash: '',
                  state: undefined,
                  key: expect.any(String),
                },
                action: 'PUSH',
              },
            ],
          ]);

          expect(listener2.mock.calls).toMatchObject([
            [
              {
                location: {
                  pathname: '/test2',
                  search: '',
                  hash: '',
                  state: undefined,
                  key: expect.any(String),
                },
                action: 'PUSH',
              },
            ],
          ]);
        });
      });

      describe('#replace()', () => {
        it('replaces a new root location onto the root history', () => {
          historyService1.rootHistory.replace({pathname: '/foo'});

          expect(window.location.href).toBe('http://example.com/foo');
          expect(replaceStateSpy).toHaveBeenCalledTimes(1);
        });

        it('puts state into the root location', () => {
          historyService1.rootHistory.replace({pathname: '/foo'}, {foo: 1});

          expect(historyService1.rootHistory.location).toMatchObject({
            pathname: '/foo',
            state: {foo: 1},
          });
        });

        it('normalizes the pathname', () => {
          historyService1.rootHistory.replace({pathname: 'foo'});

          expect(window.location.href).toBe('http://example.com/foo');
        });

        it('handles relative pathnames', () => {
          historyService1.rootHistory.replace({
            pathname: '/foo/bar',
          });

          historyService1.rootHistory.replace({pathname: 'baz'});

          expect(window.location.href).toBe('http://example.com/foo/baz');
        });

        it('changes the location and action of affected consumer histories', () => {
          const {
            state,
            ...to
          } = historyService1.createNewRootLocationForMultipleConsumers({
            historyKey: 'test2',
            location: {pathname: '/test2'},
          });

          historyService1.rootHistory.replace(to, state);

          expect(historyService1.history.location).toMatchObject({
            pathname: '/',
          });

          expect(historyService1.history.action).toBe('POP');

          expect(historyService2.history.location).toMatchObject({
            pathname: '/test2',
          });

          expect(historyService2.history.action).toBe('REPLACE');
        });

        it('notifies affected consumer history listeners', () => {
          const listener1 = jest.fn();
          const listener2 = jest.fn();

          historyService1.history.listen(listener1);
          historyService2.history.listen(listener2);

          const {
            state,
            ...to
          } = historyService1.createNewRootLocationForMultipleConsumers({
            historyKey: 'test2',
            location: {pathname: '/test2'},
          });

          historyService1.rootHistory.replace(to, state);

          expect(listener1).not.toHaveBeenCalled();
          expect(listener2).toHaveBeenCalledTimes(1);
        });
      });

      describe('#listen()', () => {
        it('calls listeners for consumer history changes', () => {
          const listenerSpy = jest.fn();

          historyService1.rootHistory.listen(listenerSpy);
          historyService1.history.push('/bar');

          expect(listenerSpy.mock.calls).toMatchObject([
            [
              {
                location: {
                  pathname: '/',
                  search: createSearch({test1: '/bar'}),
                  state: {test1: {state: undefined, key: expect.any(String)}},
                },
                action: 'PUSH',
              },
            ],
          ]);
        });

        it('calls listeners for root history changes', () => {
          const listenerSpy = jest.fn();

          historyService1.rootHistory.listen(listenerSpy);
          historyService1.rootHistory.push({pathname: '/foo'});

          expect(listenerSpy.mock.calls).toEqual([
            [
              {
                location: expect.objectContaining({pathname: '/foo'}),
                action: 'PUSH',
              },
            ],
          ]);
        });

        it('returns an unregister function', () => {
          const listenerSpy = jest.fn();
          const unregister = historyService1.rootHistory.listen(listenerSpy);

          historyService1.rootHistory.push({pathname: '/foo'});
          unregister();
          historyService1.rootHistory.push({pathname: '/bar'});

          expect(listenerSpy).toHaveBeenCalledTimes(1);
        });

        describe('for a POP action', () => {
          it('calls listeners with a POP event', () => {
            const listenerSpy = jest.fn();
            const state = window.history.state;
            const href = window.location.href;

            historyService1.history.push('/foo');
            historyService1.rootHistory.listen(listenerSpy);

            simulateOnPopState(state, href);

            expect(listenerSpy).toHaveBeenCalledWith({
              location: expect.objectContaining({pathname: '/'}),
              action: 'POP',
            });
          });
        });
      });

      describe('#createHref()', () => {
        it('returns the href for the given root location', () => {
          historyService1.rootHistory.push({pathname: '/foo'});

          const location = {pathname: '/bar', search: '?a=b'};
          const href = historyService1.rootHistory.createHref(location);

          expect(href).toBe('/bar?a=b');
        });
      });
    });

    describe('#createNewRootLocationForMultipleConsumers', () => {
      it('creates a new root location for a single consumer', () => {
        const historyServiceBinder = createHistoryServiceBinder();
        const historyService = historyServiceBinder('test1').featureService;

        const location = historyService.createNewRootLocationForMultipleConsumers(
          {historyKey: 'test1', location: {pathname: '/test1'}, state: 42}
        );

        expect(location).toMatchObject({
          pathname: '/',
          search: createSearch({test1: '/test1'}),
          state: {test1: {state: 42, key: expect.any(String)}},
        });
      });

      it('creates a new root location for two consumers', () => {
        const historyServiceBinder = createHistoryServiceBinder();
        const historyService = historyServiceBinder('test1').featureService;

        const location = historyService.createNewRootLocationForMultipleConsumers(
          {
            historyKey: 'test1',
            location: {pathname: '/test'},
            state: 42,
          },
          {
            historyKey: 'test2',
            location: {pathname: '/xxx'},
            state: 'foo',
          }
        );

        expect(location).toMatchObject({
          pathname: '/',
          search: createSearch({test1: '/test', test2: '/xxx'}),
          state: {
            test1: {state: 42, key: expect.any(String)},
            test2: {state: 'foo', key: expect.any(String)},
          },
        });
      });

      describe('with a createNewRootLocationForMultipleConsumers method defined in the root location transformer', () => {
        let createNewRootLocationForMultipleConsumersMock: jest.Mock;
        let historyServiceTest1: HistoryServiceV3;

        beforeEach(() => {
          createNewRootLocationForMultipleConsumersMock = jest.fn(() => ({
            pathname: 'root-test',
          }));

          createHistoryServiceBinder = () => {
            const sharedHistoryService = defineHistoryService({
              createRootLocation: jest.fn(),
              getConsumerPathFromRootLocation: jest.fn(),
              createNewRootLocationForMultipleConsumers: createNewRootLocationForMultipleConsumersMock,
            }).create(mockEnv);

            return sharedHistoryService!['3.0.0'];
          };

          const historyServiceBinder = createHistoryServiceBinder();
          historyServiceTest1 = historyServiceBinder('test1').featureService;
        });

        it('uses the custom createNewRootLocationForMultipleConsumers method', () => {
          const consumerLocation = {
            historyKey: 'test1',
            location: {pathname: '/test1'},
          };

          historyServiceTest1.createNewRootLocationForMultipleConsumers(
            consumerLocation
          );

          expect(
            createNewRootLocationForMultipleConsumersMock.mock.calls
          ).toEqual([[consumerLocation]]);
        });

        it('sets the consumer states on the new root location', () => {
          const consumerLocation: ConsumerLocationV3 = {
            historyKey: 'test1',
            location: {pathname: '/test1'},
            state: 42,
          };

          const location = historyServiceTest1.createNewRootLocationForMultipleConsumers(
            consumerLocation
          );

          const expectedRootLocation: RootLocation = {
            pathname: 'root-test',
            search: '',
            hash: '',
            state: {
              test1: {state: 42, key: expect.any(String)},
            },
          };

          expect(location).toMatchObject(expectedRootLocation);
        });
      });
    });

    describe('when no Logger Feature Service is provided', () => {
      let consoleWarnSpy: jest.SpyInstance;

      beforeEach(() => {
        consoleWarnSpy = jest.spyOn(console, 'warn');
        mockEnv.featureServices['s2:logger'] = undefined;
      });

      afterEach(() => {
        consoleWarnSpy.mockRestore();
      });

      it('logs messages using the console', () => {
        const historyServiceBinder = createHistoryServiceBinder();
        const historyService = historyServiceBinder('test1').featureService;
        const browserHistory = historyService.history;

        browserHistory.go(-1);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'history.go() is not supported.'
        );
      });
    });
  });
});
