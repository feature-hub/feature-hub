import {FeatureServiceBinder, FeatureServiceBinding} from '@feature-hub/core';
import * as history from 'history';
import {HistoryServiceV3} from '..';
import {BrowserConsumerHistory} from './browser-consumer-history';
import {HistoryMultiplexers} from './create-history-multiplexers';
import {HistoryMultiplexer} from './history-multiplexer';
import {HistoryServiceContext} from './history-service-context';
import {StaticConsumerHistory} from './static-consumer-history';

function createHistoryServiceV3(
  historyKey: string,
  consumerHistory: history.History,
  historyMultiplexer: HistoryMultiplexer
): HistoryServiceV3 {
  return {
    historyKey,
    history: consumerHistory,
    rootHistory: historyMultiplexer.rootHistory,

    createNewRootLocationForMultipleConsumers: (...consumerLocations) =>
      historyMultiplexer.createNewRootLocationForMultipleConsumers(
        ...consumerLocations
      ),
  };
}

function createBrowserHistoryServiceV3Binding(
  context: HistoryServiceContext,
  historyMultiplexers: HistoryMultiplexers,
  consumerId: string
): FeatureServiceBinding<HistoryServiceV3> {
  const consumerHistory = new BrowserConsumerHistory(
    context,
    consumerId,
    historyMultiplexers.browserHistoryMultiplexer
  );

  return {
    featureService: createHistoryServiceV3(
      consumerId,
      consumerHistory,
      historyMultiplexers.browserHistoryMultiplexer
    ),

    unbind: () => {
      consumerHistory.destroy();
    },
  };
}

function createStaticHistoryServiceV3Binding(
  context: HistoryServiceContext,
  historyMultiplexers: HistoryMultiplexers,
  consumerId: string
): FeatureServiceBinding<HistoryServiceV3> {
  const consumerHistory = new StaticConsumerHistory(
    context,
    consumerId,
    historyMultiplexers.staticHistoryMultiplexer
  );

  return {
    featureService: createHistoryServiceV3(
      consumerId,
      consumerHistory,
      historyMultiplexers.staticHistoryMultiplexer
    ),
  };
}

export function createHistoryServiceV3Binder(
  context: HistoryServiceContext,
  historyMultiplexers: HistoryMultiplexers,
  mode: 'browser' | 'static'
): FeatureServiceBinder<HistoryServiceV3> {
  return (consumerId: string): FeatureServiceBinding<HistoryServiceV3> =>
    mode === 'browser'
      ? createBrowserHistoryServiceV3Binding(
          context,
          historyMultiplexers,
          consumerId
        )
      : createStaticHistoryServiceV3Binding(
          context,
          historyMultiplexers,
          consumerId
        );
}
