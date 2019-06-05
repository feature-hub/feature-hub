import {FeatureServiceBinder, FeatureServiceBinding} from '@feature-hub/core';
import * as history from 'history';
import {HistoryServiceV1} from '../define-history-service';
import {BrowserConsumerHistory} from './browser-consumer-history';
import {HistoryMultiplexers} from './create-history-multiplexers';
import {HistoryServiceContext} from './history-service-context';
import {StaticConsumerHistory} from './static-consumer-history';

export function createHistoryServiceV1Binder(
  context: HistoryServiceContext,
  historyMultiplexers: HistoryMultiplexers
): FeatureServiceBinder<HistoryServiceV1> {
  return (consumerId: string): FeatureServiceBinding<HistoryServiceV1> => {
    let browserConsumerHistory: BrowserConsumerHistory | undefined;
    let staticConsumerHistory: history.History | undefined;

    const featureService: HistoryServiceV1 = {
      createBrowserHistory: () => {
        if (browserConsumerHistory) {
          context.logger.warn(
            `createBrowserHistory was called multiple times by consumer ${JSON.stringify(
              consumerId
            )}. Returning the same history instance as before.`
          );
        } else {
          browserConsumerHistory = new BrowserConsumerHistory(
            context,
            consumerId,
            historyMultiplexers.browserHistoryMultiplexer
          );
        }

        return browserConsumerHistory;
      },

      createStaticHistory: () => {
        if (staticConsumerHistory) {
          context.logger.warn(
            `createStaticHistory was called multiple times by consumer ${JSON.stringify(
              consumerId
            )}. Returning the same history instance as before.`
          );
        } else {
          staticConsumerHistory = new StaticConsumerHistory(
            context,
            consumerId,
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
