import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  FeatureServices,
  SharedFeatureService
} from '@feature-hub/core';
import {Logger} from '@feature-hub/logger';
import {ServerRequestV1} from '@feature-hub/server-request';
import * as history from 'history';
import {
  ConsumerLocation,
  RootLocationTransformer
} from './create-root-location-transformer';
import {createHistoryMultiplexers} from './internal/create-history-multiplexers';
import {createHistoryServiceV1Binder} from './internal/create-history-service-v1-binder';
import {createHistoryServiceV2Binder} from './internal/create-history-service-v2-binder';
import {createHistoryServiceContext} from './internal/history-service-context';

/**
 * @deprecated Use [[HistoryServiceV1]] instead.
 */
export type HistoryServiceV0 = HistoryServiceV1;

export interface HistoryServiceV2 {
  history: history.History;
  rootHistory: RootHistoryServiceV2;
}

export interface HistoryServiceV1 {
  readonly staticRootLocation: history.Location;

  createBrowserHistory(): history.History;
  createStaticHistory(): history.History;
}

export interface RootHistoryServiceV2 {
  readonly location: history.Location;
  push(location: history.Location): void;
  replace(location: history.Location): void;
  createHref(location: history.Location): string;
  createLocation(...consumerLocations: ConsumerLocation[]): history.Location;
}

export interface SharedHistoryService extends SharedFeatureService {
  readonly '1.0.0': FeatureServiceBinder<HistoryServiceV1>;
}

export interface HistoryServiceDependencies extends FeatureServices {
  readonly 's2:logger'?: Logger;
  readonly 's2:server-request'?: ServerRequestV1;
}

export function defineHistoryService(
  rootLocationTransformer: RootLocationTransformer,
  browser: boolean
): FeatureServiceProviderDefinition<
  SharedHistoryService,
  HistoryServiceDependencies
> {
  return {
    id: 's2:history',

    optionalDependencies: {
      featureServices: {
        's2:logger': '^1.0.0',
        's2:server-request': '^1.0.0'
      }
    },

    create: env => {
      const context = createHistoryServiceContext(env.featureServices);

      const historyMultiplexers = createHistoryMultiplexers(
        context,
        rootLocationTransformer
      );

      return {
        '1.0.0': createHistoryServiceV1Binder(context, historyMultiplexers),
        '2.0.0': createHistoryServiceV2Binder(
          browser,
          context,
          historyMultiplexers
        )
      };
    }
  };
}
