import {FeatureServiceBinder, FeatureServiceBinding} from '@feature-hub/core';
import * as history from 'history';
import {HistoryServiceV3} from '..';
import {BrowserConsumerHistory} from './browser-consumer-history';
import {HistoryMultiplexers} from './create-history-multiplexers';
import {HistoryMultiplexer} from './history-multiplexer';
import {HistoryServiceContext} from './history-service-context';
import {StaticConsumerHistory} from './static-consumer-history';

export interface CreateHistoryServiceV3BinderOptions {
  readonly mode: 'browser' | 'static';
  readonly getHistoryKey: (options: GetHistoryKeyOptions) => string;
}

export interface GetHistoryKeyOptions {
  readonly consumerId: string;
  readonly consumerName?: string;
}

function createHistoryServiceV3(
  historyKey: string,
  consumerHistory: history.History,
  historyMultiplexer: HistoryMultiplexer,
): HistoryServiceV3 {
  return {
    historyKey,
    history: consumerHistory,
    rootHistory: historyMultiplexer.rootHistory,

    createNewRootLocationForMultipleConsumers: (...consumerLocations) =>
      historyMultiplexer.createNewRootLocationForMultipleConsumers(
        ...consumerLocations,
      ),
  };
}

function createBrowserHistoryServiceV3Binding(
  context: HistoryServiceContext,
  historyMultiplexers: HistoryMultiplexers,
  historyKey: string,
): FeatureServiceBinding<HistoryServiceV3> {
  const consumerHistory = new BrowserConsumerHistory(
    context,
    historyKey,
    historyMultiplexers.browserHistoryMultiplexer,
  );

  return {
    featureService: createHistoryServiceV3(
      historyKey,
      consumerHistory,
      historyMultiplexers.browserHistoryMultiplexer,
    ),

    unbind: () => {
      consumerHistory.destroy();
    },
  };
}

function createStaticHistoryServiceV3Binding(
  context: HistoryServiceContext,
  historyMultiplexers: HistoryMultiplexers,
  consumerId: string,
): FeatureServiceBinding<HistoryServiceV3> {
  const consumerHistory = new StaticConsumerHistory(
    context,
    consumerId,
    historyMultiplexers.staticHistoryMultiplexer,
  );

  return {
    featureService: createHistoryServiceV3(
      consumerId,
      consumerHistory,
      historyMultiplexers.staticHistoryMultiplexer,
    ),
  };
}

export function createHistoryServiceV3Binder(
  context: HistoryServiceContext,
  historyMultiplexers: HistoryMultiplexers,
  options: CreateHistoryServiceV3BinderOptions,
): FeatureServiceBinder<HistoryServiceV3> {
  const {mode, getHistoryKey} = options;

  return (
    consumerId,
    consumerName,
  ): FeatureServiceBinding<HistoryServiceV3> => {
    const historyKey = getHistoryKey({consumerId, consumerName});

    return mode === 'browser'
      ? createBrowserHistoryServiceV3Binding(
          context,
          historyMultiplexers,
          historyKey,
        )
      : createStaticHistoryServiceV3Binding(
          context,
          historyMultiplexers,
          historyKey,
        );
  };
}
