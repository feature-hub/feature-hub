import {FeatureServiceBinder, FeatureServiceBinding} from '@feature-hub/core';
import {HistoryServiceV1} from '..';
import * as historyV4 from '../history-v4';
import {BrowserConsumerHistory} from './browser-consumer-history';
import {HistoryMultiplexers} from './create-history-multiplexers';
import {GetHistoryKeyOptions} from './create-history-service-v3-binder';
import {createHistoryV4Adapter} from './create-history-v4-adapter';
import {HistoryServiceContext} from './history-service-context';
import {StaticConsumerHistory} from './static-consumer-history';

export interface CreateHistoryServiceV1BinderOptions {
  readonly getHistoryKey: (options: GetHistoryKeyOptions) => string;
}

export function createHistoryServiceV1Binder(
  context: HistoryServiceContext,
  historyMultiplexers: HistoryMultiplexers,
  options: CreateHistoryServiceV1BinderOptions
): FeatureServiceBinder<HistoryServiceV1> {
  const {getHistoryKey} = options;

  return (
    consumerId,
    consumerName
  ): FeatureServiceBinding<HistoryServiceV1> => {
    const historyKey = getHistoryKey({consumerId, consumerName});

    let browserConsumerHistoryDestroy: () => void = () => undefined;
    let browserConsumerHistory: historyV4.History | undefined;
    let staticConsumerHistory: historyV4.History | undefined;

    const featureService: HistoryServiceV1 = {
      createBrowserHistory: () => {
        if (browserConsumerHistory) {
          context.logger.warn(
            `createBrowserHistory was called multiple times by consumer ${JSON.stringify(
              consumerId
            )}. Returning the same history instance as before.`
          );
        } else {
          const browserConsumerHistoryV5 = new BrowserConsumerHistory(
            context,
            historyKey,
            historyMultiplexers.browserHistoryMultiplexer
          );

          browserConsumerHistoryDestroy = () =>
            browserConsumerHistoryV5.destroy();

          browserConsumerHistory = createHistoryV4Adapter(
            context,
            browserConsumerHistoryV5
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
          staticConsumerHistory = createHistoryV4Adapter(
            context,
            new StaticConsumerHistory(
              context,
              historyKey,
              historyMultiplexers.staticHistoryMultiplexer
            )
          );
        }

        return staticConsumerHistory;
      },

      get staticRootLocation(): historyV4.Location {
        return historyMultiplexers.staticHistoryMultiplexer.rootLocation;
      },
    };

    const unbind = () => {
      browserConsumerHistoryDestroy();
    };

    return {featureService, unbind};
  };
}
