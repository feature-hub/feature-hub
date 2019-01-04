import {Location} from 'history';
import {createRootLocationTransformer} from '..';

describe('#createRootLocationTransformer', () => {
  describe('#createRootLocation', () => {
    describe('without a primary', () => {
      it('joins all consumer locations together as a single encoded query param', () => {
        const locationTransformer = createRootLocationTransformer({
          consumerPathsQueryParamName: '---'
        });

        let rootLocation = locationTransformer.createRootLocation(
          {pathname: '/foo'} as Location,
          {pathname: '/'} as Location,
          'test:1'
        );

        rootLocation = locationTransformer.createRootLocation(
          {
            pathname: '/bar',
            search: 'baz=1'
          } as Location,
          rootLocation as Location,
          'test:2'
        );

        expect(rootLocation).toMatchObject({
          pathname: '/',
          search:
            '---=%7B%22test%3A1%22%3A%22%2Ffoo%22%2C%22test%3A2%22%3A%22%2Fbar%3Fbaz%3D1%22%7D'
        });
      });

      it('removes undefined consumer locations from the query parameter', () => {
        const locationTransformer = createRootLocationTransformer({
          consumerPathsQueryParamName: '---'
        });

        let rootLocation = locationTransformer.createRootLocation(
          {pathname: '/foo'} as Location,
          {
            pathname: '/',
            search: '---=%7B%22test%3A2%22%3A%22%2Fbar%22%7D'
          } as Location,
          'test:1'
        );

        rootLocation = locationTransformer.createRootLocation(
          undefined,
          rootLocation as Location,
          'test:1'
        );

        expect(rootLocation).toMatchObject({
          pathname: '/',
          search: '---=%7B%22test%3A2%22%3A%22%2Fbar%22%7D'
        });
      });

      it('does not throw when a consumer location is removed twice', () => {
        const locationTransformer = createRootLocationTransformer({
          consumerPathsQueryParamName: '---'
        });

        let rootLocation = locationTransformer.createRootLocation(
          {pathname: '/foo'} as Location,
          {pathname: '/'} as Location,
          'test:1'
        );

        rootLocation = locationTransformer.createRootLocation(
          undefined,
          rootLocation as Location,
          'test:1'
        );

        rootLocation = locationTransformer.createRootLocation(
          undefined,
          rootLocation as Location,
          'test:1'
        );

        expect(rootLocation).toMatchObject({
          pathname: '/',
          search: ''
        });
      });
    });

    describe('with only a primary', () => {
      it('puts the location pathname and query params directly to the root location', () => {
        const locationTransformer = createRootLocationTransformer({
          consumerPathsQueryParamName: '---',
          primaryConsumerUid: 'test:pri'
        });

        const rootLocation = locationTransformer.createRootLocation(
          {pathname: '/foo', search: 'bar=1&baz=2'} as Location,
          {pathname: '/'} as Location,
          'test:pri'
        );

        expect(rootLocation).toMatchObject({
          pathname: '/foo',
          search: 'bar=1&baz=2'
        });
      });

      it('removes undefined consumer locations from the query parameter', () => {
        const locationTransformer = createRootLocationTransformer({
          consumerPathsQueryParamName: '---',
          primaryConsumerUid: 'test:pri'
        });

        let rootLocation = locationTransformer.createRootLocation(
          {pathname: '/foo'} as Location,
          {pathname: '/'} as Location,
          'test:pri'
        );

        rootLocation = locationTransformer.createRootLocation(
          undefined,
          rootLocation as Location,
          'test:pri'
        );

        expect(rootLocation).toMatchObject({
          pathname: '/',
          search: ''
        });
      });

      describe('when the primary tries to set a query param that conflicts with the consumer paths query param', () => {
        it('throws an error', () => {
          const locationTransformer = createRootLocationTransformer({
            consumerPathsQueryParamName: '---',
            primaryConsumerUid: 'test:pri'
          });

          expect(() =>
            locationTransformer.createRootLocation(
              {pathname: '/foo', search: '---=1'} as Location,
              {pathname: '/'} as Location,
              'test:pri'
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
      it('takes the pathname and query params of the primary consumer directly, and the pathname and query params of the other consumers encoded as a single query param, into the root location', () => {
        const locationTransformer = createRootLocationTransformer({
          consumerPathsQueryParamName: '---',
          primaryConsumerUid: 'test:pri'
        });

        let rootLocation = locationTransformer.createRootLocation(
          {pathname: '/foo', search: 'bar=1'} as Location,
          {pathname: '/'} as Location,
          'test:pri'
        );

        rootLocation = locationTransformer.createRootLocation(
          {
            pathname: '/baz',
            search: 'qux=3'
          } as Location,
          rootLocation as Location,
          'test:1'
        );

        rootLocation = locationTransformer.createRootLocation(
          {
            pathname: '/some',
            search: 'thing=else'
          } as Location,
          rootLocation as Location,
          'test:2'
        );

        rootLocation = locationTransformer.createRootLocation(
          {
            pathname: '/foo',
            search: 'bar=2'
          } as Location,
          rootLocation as Location,
          'test:pri'
        );

        expect(rootLocation).toMatchObject({
          pathname: '/foo',
          search:
            'bar=2&---=%7B%22test%3A1%22%3A%22%2Fbaz%3Fqux%3D3%22%2C%22test%3A2%22%3A%22%2Fsome%3Fthing%3Delse%22%7D'
        });
      });
    });
  });

  describe('#getConsumerPathFromRootLocation', () => {
    describe('with consumers encoded into the query parameter', () => {
      it('returns the consumer-specific locations', () => {
        const locationTransformer = createRootLocationTransformer({
          consumerPathsQueryParamName: '---',
          primaryConsumerUid: 'test:pri'
        });

        const rootLocation = {
          pathname: '/foo',
          search: 'bar=1&---=%7B%22test%3A1%22%3A%22%2Fbaz%3Fqux%3D3%22%7D'
        };

        expect(
          locationTransformer.getConsumerPathFromRootLocation(
            rootLocation as Location,
            'test:pri'
          )
        ).toEqual('/foo?bar=1');

        expect(
          locationTransformer.getConsumerPathFromRootLocation(
            rootLocation as Location,
            'test:1'
          )
        ).toEqual('/baz?qux=3');

        expect(
          locationTransformer.getConsumerPathFromRootLocation(
            rootLocation as Location,
            'test:2'
          )
        ).toBeUndefined();
      });
    });

    describe('without consumers encoded into the query parameter', () => {
      it('returns undefined for a non-primary consumer', () => {
        const locationTransformer = createRootLocationTransformer({
          consumerPathsQueryParamName: '---',
          primaryConsumerUid: 'test:pri'
        });

        const rootLocation = {
          pathname: '/foo',
          search: 'bar=1'
        };

        expect(
          locationTransformer.getConsumerPathFromRootLocation(
            rootLocation as Location,
            'test:2'
          )
        ).toBeUndefined();
      });
    });
  });
});
