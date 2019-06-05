/**
 * @jest-environment node
 */

// tslint:disable:no-implicit-dependencies
// tslint:disable:no-non-null-assertion

import {
  FeatureServiceBinder,
  FeatureServiceBinding,
  FeatureServiceEnvironment
} from '@feature-hub/core';
import {ServerRequestV1} from '@feature-hub/server-request';
import {History} from 'history';
import {Stubbed, stubMethods} from 'jest-stub-methods';
import {
  HistoryServiceDependencies,
  HistoryServiceV1,
  defineHistoryService
} from '..';
import {testRootLocationTransformer} from '../internal/test-root-location-transformer';
import {stubbedLogger} from './stubbed-logger';
import {Writable} from './writable';

describe('HistoryServiceV1 (on Node.js)', () => {
  let mockEnv: FeatureServiceEnvironment<Writable<HistoryServiceDependencies>>;
  let createHistoryServiceBinder: () => FeatureServiceBinder<HistoryServiceV1>;

  beforeEach(() => {
    mockEnv = {featureServices: {'s2:logger': stubbedLogger}};

    createHistoryServiceBinder = () => {
      const sharedHistoryService = defineHistoryService(
        testRootLocationTransformer
      ).create(mockEnv);

      return sharedHistoryService['1.0.0'];
    };
  });

  describe('#createStaticHistory()', () => {
    let historyBinding1: FeatureServiceBinding<HistoryServiceV1>;
    let historyBinding2: FeatureServiceBinding<HistoryServiceV1>;
    let historyService1: HistoryServiceV1;
    let historyService2: HistoryServiceV1;
    let history1: History;
    let history2: History;

    const createHistories = (serverRequest: ServerRequestV1 | undefined) => {
      mockEnv.featureServices['s2:server-request'] = serverRequest;

      const historyServiceBinder = createHistoryServiceBinder();

      historyBinding1 = historyServiceBinder('test:1');
      historyService1 = historyBinding1.featureService;
      history1 = historyService1.createStaticHistory();

      historyBinding2 = historyServiceBinder('test:2');
      historyService2 = historyBinding2.featureService;
      history2 = historyService2.createStaticHistory();
    };

    const destroyHistories = () => {
      historyBinding1.unbind!();
      historyBinding2.unbind!();
    };

    beforeEach(() =>
      createHistories({
        url: '/example',
        cookies: {},
        headers: {}
      })
    );

    afterEach(destroyHistories);

    describe('when no server request is provided', () => {
      it('throws an error', () => {
        expect(() => createHistories(undefined)).toThrowError(
          new Error(
            'Static history can not be created without a server request.'
          )
        );
      });
    });

    describe('when called multiple times for the same consumer', () => {
      it('returns the same instance and logs a warning', () => {
        expect(historyBinding1.featureService.createStaticHistory()).toEqual(
          history1
        );

        expect(stubbedLogger.warn).toHaveBeenCalledWith(
          'createStaticHistory was called multiple times by consumer "test:1". Returning the same history instance as before.'
        );
      });
    });

    describe('#length', () => {
      it('always returns 1', () => {
        expect(history1.length).toBe(1);
        expect(history2.length).toBe(1);

        history1.push('/foo');
        history1.push('/bar');
        history1.replace('/qux');
        history2.push('/baz');
        history2.replace('/quux');

        expect(history1.length).toBe(1);
        expect(history2.length).toBe(1);
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

      it('retrieves consumer specific locations from the server request path', () => {
        destroyHistories();

        const serverRequest: ServerRequestV1 = {
          url: '/?test:1=/foo&test:2=bar',
          cookies: {},
          headers: {}
        };

        createHistories(serverRequest);

        expect(history1.location).toMatchObject({pathname: '/foo'});
        expect(history2.location).toMatchObject({pathname: '/bar'});
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
      it('changes the static root location for every consumer push', () => {
        history1.push('/foo');

        expect(historyService1.staticRootLocation).toMatchObject({
          search: '?test:1=/foo'
        });

        history2.push('/bar?baz=1');

        expect(historyService1.staticRootLocation).toMatchObject({
          search: '?test:1=/foo&test:2=/bar?baz=1'
        });
      });

      it('normalizes the pathname', () => {
        history1.push('foo');

        expect(historyService1.staticRootLocation).toMatchObject({
          search: '?test:1=/foo'
        });
      });

      it('handles relative pathnames', () => {
        history1.push('/foo/bar');
        history1.push('baz');

        expect(historyService1.staticRootLocation).toMatchObject({
          search: '?test:1=/foo/baz'
        });
      });
    });

    describe('#replace()', () => {
      it('changes the static root location for every consumer replace', () => {
        history1.replace('/foo');

        expect(historyService1.staticRootLocation).toMatchObject({
          search: '?test:1=/foo'
        });

        history2.replace('/bar?baz=1');

        expect(historyService1.staticRootLocation).toMatchObject({
          search: '?test:1=/foo&test:2=/bar?baz=1'
        });
      });

      it('normalizes the pathname', () => {
        history1.replace('foo');

        expect(historyService1.staticRootLocation).toMatchObject({
          search: '?test:1=/foo'
        });
      });

      it('handles relative pathnames', () => {
        history1.replace('/foo/bar');
        history1.replace('baz');

        expect(historyService1.staticRootLocation).toMatchObject({
          search: '?test:1=/foo/baz'
        });
      });
    });

    describe('#go()', () => {
      it('does nothing and logs a warning that go() is not supported', () => {
        history1.push('/foo');

        const rootLocation = historyService1.staticRootLocation;

        history1.go(-1);

        expect(historyService1.staticRootLocation).toBe(rootLocation);

        expect(stubbedLogger.warn).toHaveBeenCalledWith(
          'history.go() is not supported.'
        );
      });
    });

    describe('#goBack()', () => {
      it('does nothing and logs a warning that goBack() is not supported', () => {
        history1.push('/foo');

        const rootLocation = historyService1.staticRootLocation;

        history1.goBack();

        expect(historyService1.staticRootLocation).toBe(rootLocation);

        expect(stubbedLogger.warn).toHaveBeenCalledWith(
          'history.goBack() is not supported.'
        );
      });
    });

    describe('#goForward()', () => {
      it('does nothing and logs a warning that goForward() is not supported', () => {
        history1.push('foo');

        const rootLocation = historyService1.staticRootLocation;

        history1.goForward();

        expect(historyService1.staticRootLocation).toBe(rootLocation);

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

        expect(historyService1.staticRootLocation).toMatchObject({
          search: '?test:1=/foo?bar=1'
        });

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
      it('does nothing and logs a warning', () => {
        const listenSpy = jest.fn();

        history1.listen(listenSpy);
        history1.push('/foo?bar=1');

        expect(listenSpy).not.toHaveBeenCalled();

        expect(stubbedLogger.warn).toHaveBeenCalledWith(
          'history.listen() is not supported.'
        );
      });

      it('still returns a no-op unregister function', () => {
        const listenSpy = jest.fn();
        const unregister = history1.listen(listenSpy);

        unregister();
      });
    });

    describe('#createHref()', () => {
      it('returns the href for the given location based on the static root history', () => {
        history1.push('/foo');

        const location = {pathname: '/bar', search: '?a=b'};
        const href = history2.createHref(location);

        expect(href).toBe('/example?test:1=/foo&test:2=/bar?a=b');
      });

      it('normalizes the pathname', () => {
        history1.push('/foo');

        const location = {pathname: 'bar'};
        const href = history2.createHref(location);

        expect(href).toBe('/example?test:1=/foo&test:2=/bar');
      });
    });
  });

  describe('when no Logger Feature Service is provided', () => {
    let stubbedConsole: Stubbed<Console>;

    beforeEach(() => {
      stubbedConsole = stubMethods(console);

      mockEnv.featureServices['s2:logger'] = undefined;

      mockEnv.featureServices['s2:server-request'] = {
        url: '/',
        cookies: {},
        headers: {}
      };
    });

    afterEach(() => {
      stubbedConsole.restore();
    });

    it('logs messages using the console', () => {
      const historyServiceBinder = createHistoryServiceBinder();
      const historyService = historyServiceBinder('test:1').featureService;
      const staticHistory = historyService.createStaticHistory();

      staticHistory.go(-1);

      expect(stubbedConsole.stub.warn).toHaveBeenCalledWith(
        'history.go() is not supported.'
      );
    });
  });
});
