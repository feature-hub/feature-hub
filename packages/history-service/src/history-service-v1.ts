import {FeatureServiceBinding} from '@feature-hub/core';
import * as history from 'history';
import {RootLocationTransformer} from '.';
import {BrowserHistory} from './browser-history';
import {RootHistories} from './root-histories';

export interface HistoryServiceV1 {
  createBrowserHistory(): history.History;
}

export class HistoryServiceV1Binding
  implements FeatureServiceBinding<HistoryServiceV1> {
  private browserHistory?: BrowserHistory;

  public constructor(
    private readonly consumerId: string,
    private readonly rootHistories: RootHistories,
    private readonly rootLocationTransformer: RootLocationTransformer
  ) {}

  public get featureService(): HistoryServiceV1 {
    return {
      createBrowserHistory: () => {
        if (this.browserHistory) {
          console.warn(
            `createBrowserHistory was called multiple times by the consumer ${JSON.stringify(
              this.consumerId
            )}. Returning the same history instance as before.`
          );
        } else {
          this.browserHistory = new BrowserHistory(
            this.consumerId,
            this.rootHistories.browserHistory,
            this.rootLocationTransformer
          );
        }

        return this.browserHistory;
      }
    };
  }

  public unbind(): void {
    if (this.browserHistory) {
      this.browserHistory.destroy();
    }
  }
}
