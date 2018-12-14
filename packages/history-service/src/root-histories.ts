import {ServerRequest} from '@feature-hub/server-renderer';
import * as history from 'history';

export interface RootHistories {
  readonly browserHistory: history.History;
}

export function createRootHistories(
  _serverRequest?: ServerRequest // later needed for static root history
): RootHistories {
  let browserHistory: history.History | undefined;

  return {
    get browserHistory(): history.History {
      if (!browserHistory) {
        browserHistory = history.createBrowserHistory();
      }

      return browserHistory;
    }
  };
}
