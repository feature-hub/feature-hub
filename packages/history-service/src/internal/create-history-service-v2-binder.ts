import {FeatureServiceBinder, FeatureServiceBinding} from '@feature-hub/core';
import {HistoryServiceV2} from '..';
import {BrowserConsumerHistory} from './browser-consumer-history';
import {ConsumerHistory} from './consumer-history';
import {HistoryMultiplexers} from './create-history-multiplexers';
import {GetHistoryKeyOptions} from './create-history-service-v3-binder';
import {createHistoryV4Adapter} from './create-history-v4-adapter';
import {HistoryMultiplexer} from './history-multiplexer';
import {HistoryServiceContext} from './history-service-context';
import {StaticConsumerHistory} from './static-consumer-history';

export interface CreateHistoryServiceV2BinderOptions {
  readonly mode: 'browser' | 'static';
  readonly getHistoryKey: (options: GetHistoryKeyOptions) => string;
}

function createHistoryServiceV2(
  context: HistoryServiceContext,
  historyKey: string,
  consumerHistory: ConsumerHistory,
  historyMultiplexer: HistoryMultiplexer
): HistoryServiceV2 {
  return {
    historyKey,
    history: createHistoryV4Adapter(context, consumerHistory),
    rootHistory: historyMultiplexer.rootHistoryV2,

    createNewRootLocationForMultipleConsumers: (...consumerLocations) =>
      historyMultiplexer.createNewRootLocationForMultipleConsumers(
        ...consumerLocations.map(
          ({
            historyKey: otherHistoryKey,
            location: {pathname, search, hash, state},
          }) => ({
            historyKey: otherHistoryKey,
            location: {pathname, search, hash},
            state,
          })
        )
      ),
  };
}

function createBrowserHistoryServiceV2Binding(
  context: HistoryServiceContext,
  historyMultiplexers: HistoryMultiplexers,
  historyKey: string
): FeatureServiceBinding<HistoryServiceV2> {
  const consumerHistory = new BrowserConsumerHistory(
    context,
    historyKey,
    historyMultiplexers.browserHistoryMultiplexer
  );

  return {
    featureService: createHistoryServiceV2(
      context,
      historyKey,
      consumerHistory,
      historyMultiplexers.browserHistoryMultiplexer
    ),

    unbind: () => {
      consumerHistory.destroy();
    },
  };
}

function createStaticHistoryServiceV2Binding(
  context: HistoryServiceContext,
  historyMultiplexers: HistoryMultiplexers,
  historyKey: string
): FeatureServiceBinding<HistoryServiceV2> {
  const consumerHistory = new StaticConsumerHistory(
    context,
    historyKey,
    historyMultiplexers.staticHistoryMultiplexer
  );

  return {
    featureService: createHistoryServiceV2(
      context,
      historyKey,
      consumerHistory,
      historyMultiplexers.staticHistoryMultiplexer
    ),
  };
}

export function createHistoryServiceV2Binder(
  context: HistoryServiceContext,
  historyMultiplexers: HistoryMultiplexers,
  options: CreateHistoryServiceV2BinderOptions
): FeatureServiceBinder<HistoryServiceV2> {
  const {mode, getHistoryKey} = options;

  return (
    consumerId,
    consumerName
  ): FeatureServiceBinding<HistoryServiceV2> => {
    const historyKey = getHistoryKey({consumerId, consumerName});

    return mode === 'browser'
      ? createBrowserHistoryServiceV2Binding(
          context,
          historyMultiplexers,
          historyKey
        )
      : createStaticHistoryServiceV2Binding(
          context,
          historyMultiplexers,
          historyKey
        );
  };
}
