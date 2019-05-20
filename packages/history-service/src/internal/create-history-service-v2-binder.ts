import {FeatureServiceBinder, FeatureServiceBinding} from '@feature-hub/core';
import {HistoryServiceV2} from '../define-history-service';
import {BrowserConsumerHistory} from './browser-consumer-history';
import {HistoryMultiplexers} from './create-history-multiplexers';
import {HistoryServiceContext} from './history-service-context';
import {RootHistoryServiceV2Impl} from './root-history-service';
import {StaticConsumerHistory} from './static-consumer-history';

function createBrowserHistoryServiceV2Binder(
  context: HistoryServiceContext,
  historyMultiplexers: HistoryMultiplexers,
  consumerUid: string
): FeatureServiceBinding<HistoryServiceV2> {
  const browserConsumerHistory = new BrowserConsumerHistory(
    context,
    consumerUid,
    historyMultiplexers.browserHistoryMultiplexer
  );

  const rootHistoryService = new RootHistoryServiceV2Impl(
    historyMultiplexers.browserHistoryMultiplexer.rootHistory,
    historyMultiplexers.browserHistoryMultiplexer.rootLocationTransformer
  );
  const featureService = {
    history: browserConsumerHistory,
    rootHistory: rootHistoryService
  };
  const unbind = () => {
    browserConsumerHistory.destroy();
  };

  return {featureService, unbind};
}

function createStaticHistoryServiceV2Binder(
  context: HistoryServiceContext,
  historyMultiplexers: HistoryMultiplexers,
  consumerUid: string
): FeatureServiceBinding<HistoryServiceV2> {
  const staticConsumerHistory = new StaticConsumerHistory(
    context,
    consumerUid,
    historyMultiplexers.staticHistoryMultiplexer
  );

  const rootHistoryService = new RootHistoryServiceV2Impl(
    historyMultiplexers.staticHistoryMultiplexer.rootHistory,
    historyMultiplexers.staticHistoryMultiplexer.rootLocationTransformer
  );
  const featureService = {
    history: staticConsumerHistory,
    rootHistory: rootHistoryService
  };
  const unbind = () => {
    // no-op
  };

  return {featureService, unbind};
}

export function createHistoryServiceV2Binder(
  browser: boolean,
  context: HistoryServiceContext,
  historyMultiplexers: HistoryMultiplexers
): FeatureServiceBinder<HistoryServiceV2> {
  return (consumerUid: string): FeatureServiceBinding<HistoryServiceV2> => {
    if (browser) {
      return createBrowserHistoryServiceV2Binder(
        context,
        historyMultiplexers,
        consumerUid
      );
    }

    return createStaticHistoryServiceV2Binder(
      context,
      historyMultiplexers,
      consumerUid
    );
  };
}
