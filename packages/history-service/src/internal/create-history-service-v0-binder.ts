import {FeatureServiceBinder, FeatureServiceBinding} from '@feature-hub/core';
import * as history from 'history';
import {HistoryServiceV0} from '../define-history-service';
import {BrowserConsumerHistory} from './browser-consumer-history';
import {HistoryMultiplexers} from './create-history-multiplexers';
import {StaticConsumerHistory} from './static-consumer-history';

export function createHistoryServiceV0Binder(
  historyMultiplexers: HistoryMultiplexers
): FeatureServiceBinder<HistoryServiceV0> {
  return (consumerUid: string): FeatureServiceBinding<HistoryServiceV0> => {
    let browserConsumerHistory: BrowserConsumerHistory | undefined;
    let staticConsumerHistory: history.History | undefined;

    const featureService: HistoryServiceV0 = {
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
