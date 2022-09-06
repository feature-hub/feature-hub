import {History} from 'history';
import * as historyV4 from '../history-v4';
import {HistoryServiceContext} from './history-service-context';

export function createHistoryV4Adapter(
  context: HistoryServiceContext,
  history: History
): historyV4.History {
  return {
    get length(): number {
      return typeof window === 'undefined' ? 1 : window.history.length;
    },

    get action(): historyV4.Action {
      return history.action;
    },

    get location(): historyV4.Location {
      return history.location;
    },

    push: (location, state) => {
      if (typeof location === 'string') {
        history.push(location, state);
      } else {
        const {pathname, search, hash, state: locationState} = location;

        history.push({pathname, search, hash}, locationState);
      }
    },

    replace: (location, state) => {
      if (typeof location === 'string') {
        history.replace(location, state);
      } else {
        const {pathname, search, hash, state: locationState} = location;

        history.replace({pathname, search, hash}, locationState);
      }
    },

    go: (n) => {
      history.go(n);
    },

    goBack: () => {
      context.logger.warn('history.goBack() is not supported.');
    },

    goForward: () => {
      context.logger.warn('history.goForward() is not supported.');
    },

    block: () => history.block(() => undefined),

    listen: (listener) =>
      history.listen(({location, action}) => listener(location, action)),

    createHref: (location) => history.createHref(location),
  };
}
