import {Location} from 'history';
import {createRootLocationTransformer} from '..';
import {ConsumerPaths} from '../create-root-location-transformer';

const encodeConsumerPaths = (consumerPaths: ConsumerPaths) =>
  encodeURIComponent(JSON.stringify(consumerPaths));

describe('#createRootLocationTransformer', () => {
  describe('#createRootLocation', () => {
    describe('without a primary', () => {
      it('joins all consumer locations together as a single encoded query param', () => {
        const locationTransformer = createRootLocationTransformer({
          consumerPathsQueryParamName: '---',
        });

        let rootLocation = locationTransformer.createRootLocation(
          {pathname: '/'},
          {pathname: '/foo'},
          'test1'
        );

        rootLocation = locationTransformer.createRootLocation(
          rootLocation,
          {pathname: '/bar', search: 'baz=1'},
          'test2'
        );

        expect(rootLocation).toMatchObject({
          pathname: '/',
          search: `?---=${encodeConsumerPaths({
            test1: '/foo',
            test2: '/bar?baz=1',
          })}`,
        });
      });
    });

    describe('with only a primary', () => {
      it('puts the location pathname, query params, and hash directly to the root location', () => {
        const locationTransformer = createRootLocationTransformer({
          consumerPathsQueryParamName: '---',
          primaryConsumerHistoryKey: 'testPri',
        });

        const rootLocation = locationTransformer.createRootLocation(
          {pathname: '/'},
          {pathname: '/foo', search: '?bar=1&baz=2', hash: '#qux'},
          'testPri'
        );

        expect(rootLocation).toMatchObject({
          pathname: '/foo',
          search: '?bar=1&baz=2',
          hash: '#qux',
        });
      });

      describe('when the primary tries to set a query param that conflicts with the consumer paths query param', () => {
        it('throws an error', () => {
          const locationTransformer = createRootLocationTransformer({
            consumerPathsQueryParamName: '---',
            primaryConsumerHistoryKey: 'testPri',
          });

          expect(() =>
            locationTransformer.createRootLocation(
              {pathname: '/'},
              {pathname: '/foo', search: '?---=1'},
              'testPri'
            )
          ).toThrowError(
            new Error(
              `Primary consumer tried to set query parameter "---" which is reserverd for consumer paths.`
            )
          );
        });
      });
    });

    describe('with the primary and two other consumers', () => {
      it('takes the pathname, query params, and hash of the primary consumer directly, and the pathname and query params of the other consumers encoded as a single query param, into the root location', () => {
        const locationTransformer = createRootLocationTransformer({
          consumerPathsQueryParamName: '---',
          primaryConsumerHistoryKey: 'testPri',
        });

        let rootLocation = locationTransformer.createRootLocation(
          {pathname: '/'},
          {pathname: '/baz', search: '?qux=3'},
          'test1'
        );

        rootLocation = locationTransformer.createRootLocation(
          rootLocation,
          {pathname: '/foo', search: '?bar=1', hash: '#qux'},
          'testPri'
        );

        rootLocation = locationTransformer.createRootLocation(
          rootLocation,
          {pathname: '/some', search: '?thing=else'},
          'test2'
        );

        expect(rootLocation).toMatchObject({
          pathname: '/foo',
          search: `?bar=1&---=${encodeConsumerPaths({
            test1: '/baz?qux=3',
            test2: '/some?thing=else',
          })}`,
          hash: '#qux',
        });
      });
    });
  });

  describe('#getConsumerPathFromRootLocation', () => {
    describe('with consumers encoded into the query parameter', () => {
      it('returns the consumer-specific locations including a hash for the primary consumer', () => {
        const locationTransformer = createRootLocationTransformer({
          consumerPathsQueryParamName: '---',
          primaryConsumerHistoryKey: 'testPri',
        });

        const rootLocation = {
          pathname: '/foo',
          search: `?bar=1&---=${encodeConsumerPaths({test1: '/baz?qux=3'})}`,
          hash: '#some-anchor',
        };

        expect(
          locationTransformer.getConsumerPathFromRootLocation(
            rootLocation as Location,
            'testPri'
          )
        ).toEqual('/foo?bar=1#some-anchor');

        expect(
          locationTransformer.getConsumerPathFromRootLocation(
            rootLocation as Location,
            'test1'
          )
        ).toEqual('/baz?qux=3');

        expect(
          locationTransformer.getConsumerPathFromRootLocation(
            rootLocation as Location,
            'test2'
          )
        ).toBeUndefined();
      });
    });

    describe('without consumers encoded into the query parameter', () => {
      it('returns undefined for a non-primary consumer', () => {
        const locationTransformer = createRootLocationTransformer({
          consumerPathsQueryParamName: '---',
          primaryConsumerHistoryKey: 'testPri',
        });

        const rootLocation = {
          pathname: '/foo',
          search: '?bar=1',
        };

        expect(
          locationTransformer.getConsumerPathFromRootLocation(
            rootLocation as Location,
            'test2'
          )
        ).toBeUndefined();
      });
    });
  });
});
