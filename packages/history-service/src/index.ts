import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  FeatureServices,
  SharedFeatureService,
} from '@feature-hub/core';
import {Logger} from '@feature-hub/logger';
import {ServerRequestV1} from '@feature-hub/server-request';
import * as history from 'history';
import {RootLocationTransformer} from './create-root-location-transformer';
import * as historyV4 from './history-v4';
import {createHistoryMultiplexers} from './internal/create-history-multiplexers';
import {createHistoryServiceV1Binder} from './internal/create-history-service-v1-binder';
import {createHistoryServiceV2Binder} from './internal/create-history-service-v2-binder';
import {createHistoryServiceV3Binder} from './internal/create-history-service-v3-binder';
import {createHistoryServiceContext} from './internal/history-service-context';

export * from './create-root-location-transformer';

export interface RootHistory {
  readonly length: number;
  readonly location: RootLocation;

  push(location: RootLocationDescriptorObject): void;
  replace(location: RootLocationDescriptorObject): void;
  createHref(location: RootLocationDescriptorObject): string;
  listen(listener: historyV4.LocationListener): historyV4.UnregisterCallback;
}

export type RootLocation = historyV4.Location<ConsumerHistoryStates>;

export type RootLocationDescriptorObject = historyV4.LocationDescriptorObject<
  ConsumerHistoryStates
>;

export interface ConsumerHistoryStates {
  readonly [historyKey: string]: unknown;
}

export interface ConsumerLocation {
  readonly historyKey: string;
  readonly location: historyV4.LocationDescriptorObject;
}

export interface HistoryServiceV1 {
  readonly staticRootLocation: historyV4.Location;

  createBrowserHistory(): historyV4.History;
  createStaticHistory(): historyV4.History;
}

export interface HistoryServiceV2 {
  /**
   * The history key that has been assigned to the consumer. It can be used to
   * create a [[ConsumerLocation]].
   */
  readonly historyKey: string;

  /**
   * The consumer's own history. When location changes are applied to this
   * history, no other consumer histories are affected.
   */
  readonly history: historyV4.History;

  /**
   * Allows special consumers, like overarching navigation services, to change
   * the full root location. To create a new root location, it is recommended to
   * use the `createNewRootLocationForMultipleConsumers` method.
   */
  readonly rootHistory: RootHistory;

  /**
   * Creates a new root location from multiple consumer locations. The returned
   * location can be used for the `push`, `replace`, and `createHref` methods of
   * the `rootHistory`.
   */
  createNewRootLocationForMultipleConsumers(
    ...consumerLocations: ConsumerLocation[]
  ): RootLocationDescriptorObject;
}

export interface HistoryServiceV3 {
  /**
   * The history key that has been assigned to the consumer. It can be used to
   * create a [[ConsumerLocation]].
   */
  readonly historyKey: string;

  /**
   * The consumer's own history. When location changes are applied to this
   * history, no other consumer histories are affected.
   */
  readonly history: history.History;

  /**
   * Allows special consumers, like overarching navigation services, to change
   * the full root location. To create a new root location, it is recommended to
   * use the `createNewRootLocationForMultipleConsumers` method.
   */
  readonly rootHistory: history.History;

  /**
   * Creates a new root location from multiple consumer locations. The returned
   * location can be used for the `push`, `replace`, and `createHref` methods of
   * the `rootHistory`. Important: For `push` and `replace` calls make sure to
   * pass the returned `state` property as a second argument, e.g.:
   * ```
   *  const {state, ...to} = historyService.createNewRootLocationForMultipleConsumers({...});
   *
   *  historyService.rootHistory.push(to, state);
   * ```
   */
  createNewRootLocationForMultipleConsumers(
    ...consumerLocations: ConsumerLocationV3[]
  ): Omit<history.Location, 'key'>;
}

export interface ConsumerLocationV3 {
  readonly historyKey: string;
  readonly location: Partial<history.Path>;
  readonly state?: unknown;
}

export interface SharedHistoryService extends SharedFeatureService {
  readonly '1.0.0': FeatureServiceBinder<HistoryServiceV1>;
  readonly '2.0.0': FeatureServiceBinder<HistoryServiceV2>;
  readonly '3.0.0': FeatureServiceBinder<HistoryServiceV3>;
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
        's2:server-request': '^1.0.0',
      },
    },

    create: (env) => {
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
        ),

        '3.0.0': createHistoryServiceV3Binder(
          context,
          historyMultiplexers,
          mode
        ),
      };
    },
  };
}
