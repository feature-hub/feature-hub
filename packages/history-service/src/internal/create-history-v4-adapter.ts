import {History} from 'history';
import * as historyV4 from '../history-v4';
import {HistoryServiceContext} from './history-service-context';

export function createHistoryV4Adapter(
  context: HistoryServiceContext,
  history: History,
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
        const newLocation = extendRelativePath(location, history);
        history.push(newLocation, state);
      } else {
        const {pathname, search, hash, state: locationState} = location;

        history.push({pathname, search, hash}, locationState);
      }
    },

    replace: (location, state) => {
      if (typeof location === 'string') {
        const newLocation = extendRelativePath(location, history);

        history.replace(newLocation, state);
      } else {
        const {pathname, search, hash, state: locationState} = location;

        history.replace({pathname, search, hash}, locationState);
      }
    },

    go: () => {
      context.logger.warn('history.go() is not supported.');
    },

    goBack: () => {
      context.logger.warn('history.goBack() is not supported.');
    },

    goForward: () => {
      context.logger.warn('history.goForward() is not supported.');
    },

    block: () => {
      context.logger.warn('history.block() is not supported.');

      return () => undefined;
    },

    listen: (listener) =>
      history.listen(({location, action}) => listener(location, action)),

    createHref: (location) => history.createHref(location),
  };
}

function extendRelativePath(location: string, history: History): string {
  if (location.startsWith('?')) {
    return history.location.pathname + location;
  }
  if (location.startsWith('#')) {
    return history.location.pathname + history.location.search + location;
  }

  return location;
}
