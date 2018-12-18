import {ServerRequest} from '@feature-hub/server-renderer';
import * as history from 'history';
import {StaticRootHistory} from './static-root-history';

export interface ConsumerHistoryStates {
  readonly [consumerId: string]: unknown;
}

export interface RootHistories {
  readonly browserHistory: history.History<ConsumerHistoryStates>;
  readonly staticHistory: history.History;
}

export function createRootHistories(
  serverRequest?: ServerRequest
): RootHistories {
  let browserHistory: history.History | undefined;
  let staticHistory: history.History | undefined;

  return {
    get browserHistory(): history.History {
      if (!browserHistory) {
        browserHistory = history.createBrowserHistory();
      }

      return browserHistory;
    },

    get staticHistory(): history.History {
      if (!staticHistory) {
        if (!serverRequest) {
          throw new Error(
            'Static history can not be created without a server request.'
          );
        }

        staticHistory = new StaticRootHistory(serverRequest);
      }

      return staticHistory;
    }
  };
}
