import {FeatureServiceBinder, FeatureServiceBinding} from '@feature-hub/core';
import * as history from 'history';
import {BrowserConsumerHistory} from './internal/browser-consumer-history';
import {HistoryMultiplexers} from './internal/create-history-multiplexers';
import {StaticConsumerHistory} from './internal/static-consumer-history';

export interface HistoryServiceV1 {
  staticRootLocation: history.Location;

  createBrowserHistory(): history.History;
  createStaticHistory(): history.History;
}

export function createHistoryServiceV1Binder(
  historyMultiplexers: HistoryMultiplexers
): FeatureServiceBinder<HistoryServiceV1> {
  return (consumerUid: string): FeatureServiceBinding<HistoryServiceV1> => {
    let browserConsumerHistory: BrowserConsumerHistory | undefined;
    let staticConsumerHistory: history.History | undefined;

    const featureService: HistoryServiceV1 = {
      createBrowserHistory: () => {
        if (browserConsumerHistory) {
          console.warn(
            `createBrowserHistory was called multiple times by consumer ${JSON.stringify(
              consumerUid
            )}. Returning the same history instance as before.`
          );
        } else {
          browserConsumerHistory = new BrowserConsumerHistory(
            consumerUid,
            historyMultiplexers.browserHistoryMultiplexer
          );
        }

        return browserConsumerHistory;
      },

      createStaticHistory: () => {
        if (staticConsumerHistory) {
          console.warn(
            `createStaticHistory was called multiple times by consumer ${JSON.stringify(
              consumerUid
            )}. Returning the same history instance as before.`
          );
        } else {
          staticConsumerHistory = new StaticConsumerHistory(
            consumerUid,
            historyMultiplexers.staticHistoryMultiplexer
          );
        }

        return staticConsumerHistory;
      },

      get staticRootLocation(): history.Location {
        return historyMultiplexers.staticHistoryMultiplexer.rootLocation;
      }
    };

    const unbind = () => {
      if (browserConsumerHistory) {
        browserConsumerHistory.destroy();
      }
    };

    return {featureService, unbind};
  };
}
