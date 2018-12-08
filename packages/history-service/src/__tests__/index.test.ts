// tslint:disable:no-non-null-assertion no-unbound-method
import {
  FeatureServiceBinder,
  FeatureServiceEnvironment
} from '@feature-hub/core';
import {ServerRendererV1, ServerRequest} from '@feature-hub/server-renderer';
import {History, HistoryServiceV1, defineHistoryService} from '..';
import {RootLocationTransformer} from '../root-location-transformer';

const simulateOnPopState = (key: string) => {
  const popStateEvent = document.createEvent('Event');
  popStateEvent.initEvent('popstate', true, true);
  (popStateEvent as any).state = {key}; // tslint:disable-line:no-any
  window.dispatchEvent(popStateEvent);
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
    let mockCreateRootLocation: jest.Mock;
    let mockGetConsumerPathFromRootLocation: jest.Mock;

    const getRootLocation = (historyService: HistoryServiceV1) =>
      historyService.rootLocation &&
      `${historyService.rootLocation.pathname}${
        historyService.rootLocation.search
      }`;

    beforeEach(() => {
      // ensure the window.location.href is the same before each test
      window.history.pushState(null, '', 'http://example.com');

      pushStateSpy = jest.spyOn(window.history, 'pushState');
      replaceStateSpy = jest.spyOn(window.history, 'replaceState');
      consoleWarnSpy = jest.spyOn(console, 'warn');
      consoleWarnSpy.mockImplementation(jest.fn());

      const mockServerRequest: ServerRequest = {
        path: '/example',
        cookies: {},
        headers: {}
      };

      mockCreateRootLocation = jest.fn(() => ({pathname: 'rootpath'}));
      mockGetConsumerPathFromRootLocation = jest.fn(() => '/consumerpath');

      const mockRootLocationTransformer = {
        createRootLocation: mockCreateRootLocation,
        getConsumerPathFromRootLocation: mockGetConsumerPathFromRootLocation
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
          mockRootLocationTransformer
        ).create(mockEnv)['1.1'] as FeatureServiceBinder<HistoryServiceV1>;

        return historyServiceBinder;
      };
    });

    afterEach(() => {
      pushStateSpy.mockRestore();
      replaceStateSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    describe('#get rootLocation()', () => {
      it('returns the initially created memoryHistory location', () => {
        const historyServiceBinder = createHistoryServiceBinder();
        const service = historyServiceBinder('test').featureService;
        service.createMemoryHistory();

        const expected = {pathname: '/example', search: ''};

        expect(service.rootLocation).toMatchObject(expected);
      });

      describe('when a server request is defined', () => {
        it('returns the initially created memoryHistory location for the given request path', () => {
          const historyServiceBinder = createHistoryServiceBinder({
            path: '/test',
            cookies: {},
            headers: {}
          });

          const service = historyServiceBinder('test').featureService;
          service.createMemoryHistory();

          const expected = {pathname: '/test', search: ''};

          expect(service.rootLocation).toMatchObject(expected);
        });
      });
    });

    describe('#createBrowserHistory()', () => {
      describe('#length', () => {
        it('returns a consumer-specific history length', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createBrowserHistory();

          expect(history1.length).toBe(1);
          expect(history2.length).toBe(1);

          history1.push('/foo');
          history1.push('/bar');
          history1.replace('/qux');
          history2.push('/baz');
          history2.replace('/quux');

          expect(history1.length).toBe(3);
          expect(history2.length).toBe(2);
        });
      });

      describe('#action', () => {
        it('returns a consumer-specific action', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createBrowserHistory();

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
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createBrowserHistory();

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
          const historyServiceBinder = createHistoryServiceBinder();
          mockGetConsumerPathFromRootLocation.mockImplementation((_, id) => id);

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createBrowserHistory();

          expect(history1.location).toMatchObject({
            pathname: 'test:1'
          });

          expect(history2.location).toMatchObject({
            pathname: 'test:2'
          });
        });

        describe('when getConsumerPathFromRootLocation returns undefined', () => {
          beforeEach(() => {
            mockGetConsumerPathFromRootLocation.mockReturnValue(undefined);
          });

          it('returns the default location', () => {
            const historyServiceBinder = createHistoryServiceBinder();

            const history = historyServiceBinder(
              'test:1'
            ).featureService.createBrowserHistory();

            expect(history.location).toMatchObject({
              pathname: '/',
              search: ''
            });
          });
        });
      });

      describe('#push()', () => {
        it('pushes the root location onto the root history for every consumer push', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createBrowserHistory();

          history1.push('/foo');
          history2.push('/bar?baz=1');

          expect(window.location.href).toBe('http://example.com/rootpath');

          expect(mockCreateRootLocation).toHaveBeenCalledTimes(2);

          expect(mockCreateRootLocation.mock.calls).toMatchObject([
            [{pathname: '/foo'}, {pathname: '/'}, 'test:1'],
            [
              {
                pathname: '/bar',
                search: '?baz=1'
              },
              {pathname: '/rootpath'},
              'test:2'
            ]
          ]);

          expect(pushStateSpy).toHaveBeenCalledTimes(2);
        });
      });

      describe('#replace()', () => {
        it('replaces the root location in the root history for every consumer replace', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createBrowserHistory();

          replaceStateSpy.mockClear();

          history1.replace('/foo');
          history2.replace('/bar?baz=1');

          expect(mockCreateRootLocation.mock.calls).toMatchObject([
            [
              {
                pathname: '/foo',
                search: ''
              },
              {pathname: '/'},
              'test:1'
            ],
            [
              {
                pathname: '/bar',
                search: '?baz=1'
              },
              {pathname: '/rootpath'},
              'test:2'
            ]
          ]);

          expect(window.location.href).toBe('http://example.com/rootpath');

          expect(replaceStateSpy).toHaveBeenCalledTimes(2);
        });
      });

      describe('#go()', () => {
        it('does nothing and logs a warning that go() is not supported', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const history = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          history.push('foo');

          mockCreateRootLocation.mockClear();

          history.go(-1);

          expect(mockCreateRootLocation).not.toHaveBeenCalled();

          expect(consoleWarnSpy).toHaveBeenCalledWith(
            'history.go() is not supported.'
          );
        });
      });

      describe('#goBack()', () => {
        it('does nothing and logs a warning that goBack() is not supported', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const history = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          history.push('foo');

          mockCreateRootLocation.mockClear();

          history.goBack();

          expect(mockCreateRootLocation).not.toHaveBeenCalled();

          expect(consoleWarnSpy).toHaveBeenCalledWith(
            'history.goBack() is not supported.'
          );
        });
      });

      describe('#goForward()', () => {
        it('does nothing and logs a warning that goForward() is not supported', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const history = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          history.push('foo');

          mockCreateRootLocation.mockClear();

          history.goForward();

          expect(mockCreateRootLocation).not.toHaveBeenCalled();

          expect(window.location.href).toBe('http://example.com/rootpath');

          expect(consoleWarnSpy).toHaveBeenCalledWith(
            'history.goForward() is not supported.'
          );
        });
      });

      describe('#block()', () => {
        it('calls the given prompt hook only when the consumer-specific history changes', () => {
          const promptHookSpy1 = jest.fn();
          const promptHookSpy2 = jest.fn();
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createBrowserHistory();

          history1.block(promptHookSpy1);
          history2.block(promptHookSpy2);

          history1.push('/foo?bar=1');
          history2.push('/baz?qux=2');

          expect(promptHookSpy1).toHaveBeenCalledTimes(1);

          expect(promptHookSpy1).toHaveBeenCalledWith(
            expect.objectContaining({pathname: '/foo', search: '?bar=1'}),
            'PUSH'
          );

          expect(promptHookSpy2).toHaveBeenCalledTimes(1);

          expect(promptHookSpy2).toHaveBeenCalledWith(
            expect.objectContaining({pathname: '/baz', search: '?qux=2'}),
            'PUSH'
          );
        });

        it('returns an unblock function', () => {
          const promptHookSpy = jest.fn();
          const historyServiceBinder = createHistoryServiceBinder();

          const history = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          const unblock = history.block(promptHookSpy);

          history.push('/foo');
          unblock();
          history.push('/bar');

          expect(promptHookSpy).toHaveBeenCalledTimes(1);
        });
      });

      describe('#listen()', () => {
        it('calls listeners only for consumer-specific history changes', () => {
          const listenerSpy1 = jest.fn();
          const listenerSpy2 = jest.fn();
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createBrowserHistory();

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
          const historyServiceBinder = createHistoryServiceBinder();

          const history = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          const unregister = history.listen(listenerSpy);

          history.push('/foo');
          unregister();
          history.push('/bar');

          expect(listenerSpy).toHaveBeenCalledTimes(1);
        });

        describe('for a POP action', () => {
          let history1: History;
          let history2: History;
          let history1ListenerSpy: jest.Mock;
          let history2ListenerSpy: jest.Mock;

          beforeEach(() => {
            const historyServiceBinder = createHistoryServiceBinder();

            history1 = historyServiceBinder(
              'test:1'
            ).featureService.createBrowserHistory();

            history2 = historyServiceBinder(
              'test:2'
            ).featureService.createBrowserHistory();

            history1ListenerSpy = jest.fn();
            history1.listen(history1ListenerSpy);

            history2ListenerSpy = jest.fn();
            history2.listen(history2ListenerSpy);
          });

          it('calls listeners only for matching consumer locations', () => {
            const key = window.history.state.key;

            history1.push('/foo');
            history1ListenerSpy.mockClear();

            simulateOnPopState(key);

            expect(history1ListenerSpy).toHaveBeenCalledWith(
              expect.objectContaining({pathname: '/consumerpath'}),
              'POP'
            );

            expect(history2ListenerSpy).not.toHaveBeenCalled();
          });

          describe('with back and forward navigation', () => {
            it('calls the listener with the correct locations', () => {
              history1.push('/baz?qux=3');
              const key1 = window.history.state.key;
              history1.push('/bar?qux=4');
              const key2 = window.history.state.key;

              history1ListenerSpy.mockClear();

              simulateOnPopState(key1); // POP backward

              expect(history1ListenerSpy).toHaveBeenCalledWith(
                expect.objectContaining({pathname: '/baz', search: '?qux=3'}),
                'POP'
              );

              history1ListenerSpy.mockClear();

              simulateOnPopState(key2); // POP foward

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

              const replacedKey = window.history.state.key;

              history2.push('/b3');

              history2ListenerSpy.mockClear();

              simulateOnPopState(replacedKey); // POP to replaced location

              expect(history2ListenerSpy).toHaveBeenCalledWith(
                expect.objectContaining({pathname: '/b2'}),
                'POP'
              );
            });
          });
        });
      });

      describe('#createHref()', () => {
        it('returns the href for the given location based on the root browser history', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const history = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          const location = {pathname: '/quux', search: '?a=b'};

          const href = history.createHref(location);

          expect(mockCreateRootLocation.mock.calls).toMatchObject([
            [location, {pathname: '/'}, 'test:1']
          ]);

          expect(href).toBe('rootpath');
        });
      });

      describe('when the history consumer is destroyed', () => {
        it('removes the consumer path from the root location', () => {
          const historyServiceBinding = createHistoryServiceBinder()('test:1');
          const history = historyServiceBinding.featureService.createBrowserHistory();

          history.push('/something');

          expect(window.location.href).toBe('http://example.com/rootpath');

          mockCreateRootLocation.mockClear();

          historyServiceBinding.unbind!();

          expect(mockCreateRootLocation.mock.calls).toMatchObject([
            [undefined, {pathname: '/rootpath'}, 'test:1']
          ]);
        });

        it('does not call the listener of a destroyed consumer', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createBrowserHistory();

          const history2ServiceBinding = historyServiceBinder('test:2');
          const history2 = history2ServiceBinding.featureService.createBrowserHistory();
          const history1ListenerSpy = jest.fn();
          const history2ListenerSpy = jest.fn();

          history1.listen(history1ListenerSpy);
          history2.listen(history2ListenerSpy);

          history2.push('/baz?qux=3');
          const key1 = window.history.state.key;
          history1.push('/foo?baz=2');
          const key2 = window.history.state.key;

          history2ServiceBinding.unbind!();
          history2ListenerSpy.mockClear();

          simulateOnPopState(key1);

          expect(history2ListenerSpy).not.toHaveBeenCalled();

          simulateOnPopState(key2);

          expect(history1ListenerSpy).toHaveBeenCalled();
        });
      });
    });

    describe('#createMemoryHistory()', () => {
      it('throws without a server request', () => {
        // tslint:disable-next-line:no-any
        const historyServiceBinder = createHistoryServiceBinder(null as any);

        expect(() =>
          historyServiceBinder('test:1').featureService.createMemoryHistory()
        ).toThrowErrorMatchingInlineSnapshot(
          '"Memory history can not be created without a server request."'
        );
      });

      describe('#length', () => {
        it('returns a consumer-specific history length', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createMemoryHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createMemoryHistory();

          expect(history1.length).toBe(1);
          expect(history2.length).toBe(1);

          history1.push('/foo');
          history1.push('/bar');
          history2.push('/baz');

          expect(history1.length).toBe(3);
          expect(history2.length).toBe(2);
        });
      });

      describe('#action', () => {
        it('returns a consumer-specific action', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createMemoryHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createMemoryHistory();

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
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createMemoryHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createMemoryHistory();

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

        it('retrieves the consumer-specific locations from the initial location', () => {
          const historyServiceBinder = createHistoryServiceBinder();
          mockGetConsumerPathFromRootLocation.mockImplementation((_, id) => id);

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createMemoryHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createMemoryHistory();

          expect(history1.location).toMatchObject({
            pathname: 'test:1'
          });

          expect(history2.location).toMatchObject({
            pathname: 'test:2'
          });
        });
      });

      describe('#index', () => {
        it('returns a consumer-specific memory history index', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createMemoryHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createMemoryHistory();

          expect(history1.index).toBe(0);
          expect(history2.index).toBe(0);

          history1.push('/foo');
          history1.push('/bar');
          history2.push('/baz');

          expect(history1.index).toBe(2);
          expect(history2.index).toBe(1);
        });
      });

      describe('#entries', () => {
        it('returns consumer-specific entries', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createMemoryHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createMemoryHistory();

          history1.push('/foo', {test: 'foo'});
          history2.replace('/bar', {test: 'bar'});

          const expected1 = [
            {
              pathname: '/consumerpath',
              search: ''
            },
            {
              pathname: '/foo',
              search: '',
              state: {test: 'foo'}
            }
          ];

          expect(history1.entries).toMatchObject(expected1);

          const expected2 = [
            {
              pathname: '/bar',
              search: '',
              state: {test: 'bar'}
            }
          ];

          expect(history2.entries).toMatchObject(expected2);
        });
      });

      describe('#push()', () => {
        it('pushes the root location onto the root history for every consumer push', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const historyService = historyServiceBinder('test:1').featureService;
          const history1 = historyService.createMemoryHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createMemoryHistory();

          history1.push('/foo');
          history2.push('/bar?baz=1');

          expect(mockCreateRootLocation.mock.calls).toMatchObject([
            [
              {
                pathname: '/foo',
                search: ''
              },
              {pathname: '/example'},
              'test:1'
            ],
            [
              {
                pathname: '/bar',
                search: '?baz=1'
              },
              {pathname: '/rootpath'},
              'test:2'
            ]
          ]);

          expect(history1.length).toEqual(2);
          expect(history2.length).toEqual(2);

          expect(getRootLocation(historyService)).toBe('/rootpath');
        });
      });

      describe('#replace()', () => {
        it('replaces the root location in the root history for every consumer replace', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const historyService = historyServiceBinder('test:1').featureService;
          const history1 = historyService.createMemoryHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createMemoryHistory();

          history1.replace('/foo');
          history2.replace('/bar?baz=1');

          expect(mockCreateRootLocation.mock.calls).toMatchObject([
            [
              {
                pathname: '/foo',
                search: ''
              },
              {pathname: '/example'},
              'test:1'
            ],
            [
              {
                pathname: '/bar',
                search: '?baz=1'
              },
              {pathname: '/rootpath'},
              'test:2'
            ]
          ]);

          expect(history1.length).toEqual(1);
          expect(history2.length).toEqual(1);

          expect(getRootLocation(historyService)).toBe('/rootpath');
        });
      });

      describe('#go()', () => {
        it('does nothing and logs a warning that go() is not supported', () => {
          const historyServiceBinder = createHistoryServiceBinder();
          const historyService = historyServiceBinder('test:1').featureService;
          const history = historyService.createMemoryHistory();

          history.push('foo');
          mockCreateRootLocation.mockClear();

          history.go(-1);

          expect(mockCreateRootLocation).not.toHaveBeenCalled();

          expect(consoleWarnSpy).toHaveBeenCalledWith(
            'history.go() is not supported.'
          );
        });
      });

      describe('#goBack()', () => {
        it('does nothing and logs a warning that goBack() is not supported', () => {
          const historyServiceBinder = createHistoryServiceBinder();
          const historyService = historyServiceBinder('test:1').featureService;
          const history = historyService.createMemoryHistory();

          history.push('foo');
          mockCreateRootLocation.mockClear();

          history.goBack();

          expect(mockCreateRootLocation).not.toHaveBeenCalled();

          expect(consoleWarnSpy).toHaveBeenCalledWith(
            'history.goBack() is not supported.'
          );
        });
      });

      describe('#goForward()', () => {
        it('does nothing and logs a warning that goForward() is not supported', () => {
          const historyServiceBinder = createHistoryServiceBinder();
          const historyService = historyServiceBinder('test:1').featureService;
          const history = historyService.createMemoryHistory();

          history.push('foo');

          mockCreateRootLocation.mockClear();

          history.goForward();

          expect(mockCreateRootLocation).not.toHaveBeenCalled();

          expect(consoleWarnSpy).toHaveBeenCalledWith(
            'history.goForward() is not supported.'
          );
        });
      });

      describe('#canGo()', () => {
        it('returns false and logs a warning that canGo() is not supported', () => {
          const historyServiceBinder = createHistoryServiceBinder();
          const historyService = historyServiceBinder('test:1').featureService;
          const history = historyService.createMemoryHistory();
          history.push('foo');

          mockCreateRootLocation.mockClear();

          expect(history.canGo(-1)).toBe(false);

          expect(mockCreateRootLocation).not.toHaveBeenCalled();

          expect(consoleWarnSpy).toHaveBeenCalledWith(
            'memoryHistory.canGo() is not supported.'
          );
        });
      });

      describe('#block()', () => {
        it('calls the given prompt hook only when the consumer-specific history changes', () => {
          const promptHookSpy1 = jest.fn();
          const promptHookSpy2 = jest.fn();
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createMemoryHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createMemoryHistory();

          history1.block(promptHookSpy1);
          history2.block(promptHookSpy2);

          history1.push('/foo?bar=1');
          history2.push('/baz?qux=2');

          expect(promptHookSpy1).toHaveBeenCalledTimes(1);

          expect(promptHookSpy1).toHaveBeenCalledWith(
            expect.objectContaining({pathname: '/foo', search: '?bar=1'}),
            'PUSH'
          );

          expect(promptHookSpy2).toHaveBeenCalledTimes(1);

          expect(promptHookSpy2).toHaveBeenCalledWith(
            expect.objectContaining({pathname: '/baz', search: '?qux=2'}),
            'PUSH'
          );
        });

        it('returns an unblock function', () => {
          const promptHookSpy = jest.fn();
          const historyServiceBinder = createHistoryServiceBinder();

          const history = historyServiceBinder(
            'test:1'
          ).featureService.createMemoryHistory();

          const unblock = history.block(promptHookSpy);

          history.push('/foo');
          unblock();
          history.push('/bar');

          expect(promptHookSpy).toHaveBeenCalledTimes(1);
        });
      });

      describe('#listen()', () => {
        it('calls listeners only for consumer-specific history changes', () => {
          const listenerSpy1 = jest.fn();
          const listenerSpy2 = jest.fn();
          const historyServiceBinder = createHistoryServiceBinder();

          const history1 = historyServiceBinder(
            'test:1'
          ).featureService.createMemoryHistory();

          const history2 = historyServiceBinder(
            'test:2'
          ).featureService.createMemoryHistory();

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
          const historyServiceBinder = createHistoryServiceBinder();

          const history = historyServiceBinder(
            'test:1'
          ).featureService.createMemoryHistory();

          const unregister = history.listen(listenerSpy);

          history.push('/foo');
          unregister();
          history.push('/bar');

          expect(listenerSpy).toHaveBeenCalledTimes(1);
        });
      });

      describe('#createHref()', () => {
        it('returns the href for the given location based on the root memory history', () => {
          const historyServiceBinder = createHistoryServiceBinder();

          const history = historyServiceBinder(
            'test:1'
          ).featureService.createMemoryHistory();

          const location = {pathname: '/quux', search: '?a=b'};
          const href = history.createHref(location);

          expect(mockCreateRootLocation.mock.calls).toMatchObject([
            [location, {pathname: '/example'}, 'test:1']
          ]);

          expect(href).toBe('rootpath');
        });
      });

      describe('when the history consumer is destroyed', () => {
        it('removes the consumer path from the root location', () => {
          const serviceBinding = createHistoryServiceBinder()('test:1');
          const history = serviceBinding.featureService.createMemoryHistory();

          history.push('/foo');

          mockCreateRootLocation.mockClear();

          serviceBinding.unbind!();

          expect(mockCreateRootLocation.mock.calls).toMatchObject([
            [undefined, {pathname: '/rootpath'}, 'test:1']
          ]);
        });
      });
    });
  });
});
