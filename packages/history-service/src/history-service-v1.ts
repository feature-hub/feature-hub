import {FeatureServiceBinder, FeatureServiceBinding} from '@feature-hub/core';
import * as history from 'history';
import {RootLocationTransformer} from '.';
import {BrowserConsumerHistory} from './browser-consumer-history';
import {RootHistories} from './root-histories';
import {StaticConsumerHistory} from './static-consumer-history';

export interface HistoryServiceV1 {
  staticRootLocation: history.Location;

  createBrowserHistory(): history.History;
  createStaticHistory(): history.History;
}

export function createHistoryServiceV1Binder(
  rootHistories: RootHistories,
  rootLocationTransformer: RootLocationTransformer
): FeatureServiceBinder<HistoryServiceV1> {
  return (consumerId: string): FeatureServiceBinding<HistoryServiceV1> => {
    let browserConsumerHistory: BrowserConsumerHistory | undefined;
    let staticConsumerHistory: history.History | undefined;

    const featureService: HistoryServiceV1 = {
      createBrowserHistory: () => {
        if (browserConsumerHistory) {
          console.warn(
            `createBrowserHistory was called multiple times by the consumer ${JSON.stringify(
              consumerId
            )}. Returning the same history instance as before.`
          );
        } else {
          browserConsumerHistory = new BrowserConsumerHistory(
            consumerId,
            rootHistories.browserHistory,
            rootLocationTransformer
          );
        }

        return browserConsumerHistory;
      },

      createStaticHistory: () => {
        if (staticConsumerHistory) {
          console.warn(
            `createStaticHistory was called multiple times by the consumer ${JSON.stringify(
              consumerId
            )}. Returning the same history instance as before.`
          );
        } else {
          staticConsumerHistory = new StaticConsumerHistory(
            consumerId,
            rootHistories.staticHistory,
            rootLocationTransformer
          );
        }

        return staticConsumerHistory;
      },

      get staticRootLocation(): history.Location {
        return rootHistories.staticHistory.location;
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
