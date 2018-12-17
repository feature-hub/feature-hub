import {FeatureServiceBinder, FeatureServiceBinding} from '@feature-hub/core';
import * as history from 'history';
import {RootLocationTransformer} from '.';
import {BrowserHistory} from './browser-history';
import {RootHistories} from './root-histories';
import {StaticHistory} from './static-history';

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
    let browserHistory: BrowserHistory | undefined;
    let staticHistory: history.History | undefined;

    const featureService: HistoryServiceV1 = {
      createBrowserHistory: () => {
        if (browserHistory) {
          console.warn(
            `createBrowserHistory was called multiple times by the consumer ${JSON.stringify(
              consumerId
            )}. Returning the same history instance as before.`
          );
        } else {
          browserHistory = new BrowserHistory(
            consumerId,
            rootHistories.browserHistory,
            rootLocationTransformer
          );
        }

        return browserHistory;
      },

      createStaticHistory: () => {
        if (staticHistory) {
          console.warn(
            `createStaticHistory was called multiple times by the consumer ${JSON.stringify(
              consumerId
            )}. Returning the same history instance as before.`
          );
        } else {
          staticHistory = new StaticHistory(
            consumerId,
            rootHistories.staticHistory,
            rootLocationTransformer
          );
        }

        return staticHistory;
      },

      get staticRootLocation(): history.Location {
        return rootHistories.staticHistory.location;
      }
    };

    const unbind = () => {
      if (browserHistory) {
        browserHistory.destroy();
      }
    };

    return {featureService, unbind};
  };
}
