import {ServerRequest} from '@feature-hub/server-renderer';
import * as history from 'history';

export interface RootHistories {
  readonly browserHistory: history.History;
  readonly memoryHistory: history.MemoryHistory;
}

export function createRootHistories(
  serverRequest?: ServerRequest
): RootHistories {
  let browserHistory: history.History | undefined;
  let memoryHistory: history.MemoryHistory | undefined;

  return {
    get browserHistory(): history.History {
      if (!browserHistory) {
        browserHistory = history.createBrowserHistory();

        // We need to replace the initial location with itself to make
        // sure a key is defined.
        // See also https://github.com/ReactTraining/history/issues/502
        browserHistory.replace(browserHistory.location);
      }

      return browserHistory;
    },

    get memoryHistory(): history.MemoryHistory {
      if (!memoryHistory) {
        if (!serverRequest) {
          throw new Error(
            'Memory history can not be created without a server request.'
          );
        }

        const initialEntries = [serverRequest.path];
        memoryHistory = history.createMemoryHistory({initialEntries});
      }

      return memoryHistory;
    }
  };
}
