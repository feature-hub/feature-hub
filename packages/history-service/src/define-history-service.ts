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
  RootLocationDescriptorObject,
  RootLocationTransformer
} from './create-root-location-transformer';
import {createHistoryMultiplexers} from './internal/create-history-multiplexers';
import {createHistoryServiceV1Binder} from './internal/create-history-service-v1-binder';
import {createHistoryServiceV2Binder} from './internal/create-history-service-v2-binder';
import {ConsumerLocation, RootHistory} from './internal/history-multiplexer';
import {createHistoryServiceContext} from './internal/history-service-context';

export {ConsumerLocation, RootHistory};

export interface HistoryServiceV2 {
  readonly historyKey: string;
  readonly history: history.History;
  readonly rootHistory: RootHistory;

  createNewRootLocationForMultipleConsumers(
    ...consumerLocations: ConsumerLocation[]
  ): RootLocationDescriptorObject;
}

export interface HistoryServiceV1 {
  readonly staticRootLocation: history.Location;

  createBrowserHistory(): history.History;
  createStaticHistory(): history.History;
}

export interface SharedHistoryService extends SharedFeatureService {
  readonly '1.0.0': FeatureServiceBinder<HistoryServiceV1>;
  readonly '2.0.0': FeatureServiceBinder<HistoryServiceV2>;
}

export interface HistoryServiceDependencies extends FeatureServices {
  readonly 's2:logger'?: Logger;
  readonly 's2:server-request'?: ServerRequestV1;
}

export interface HistoryServiceDefinitionOptions {
  readonly mode?: 'browser' | 'static';
}

export function defineHistoryService(
  rootLocationTransformer: RootLocationTransformer,
  options: HistoryServiceDefinitionOptions = {}
): FeatureServiceProviderDefinition<
  SharedHistoryService,
  HistoryServiceDependencies
> {
  const {mode = 'browser'} = options;

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
          context,
          historyMultiplexers,
          mode
        )
      };
    }
  };
}
