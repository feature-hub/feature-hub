import * as history from 'history';
import {RootLocationTransformer} from '../create-root-location-transformer';
import {HistoryMultiplexer} from './history-multiplexer';
import {HistoryServiceContext} from './history-service-context';

export interface HistoryMultiplexers {
  readonly browserHistoryMultiplexer: HistoryMultiplexer;
  readonly staticHistoryMultiplexer: HistoryMultiplexer;
}

export function createHistoryMultiplexers(
  context: HistoryServiceContext,
  rootLocationTransformer: RootLocationTransformer
): HistoryMultiplexers {
  let browserHistoryMultiplexer: HistoryMultiplexer | undefined;
  let staticHistoryMultiplexer: HistoryMultiplexer | undefined;

  return {
    get browserHistoryMultiplexer(): HistoryMultiplexer {
      if (!browserHistoryMultiplexer) {
        browserHistoryMultiplexer = new HistoryMultiplexer(
          history.createBrowserHistory(),
          rootLocationTransformer
        );
      }

      return browserHistoryMultiplexer;
    },

    get staticHistoryMultiplexer(): HistoryMultiplexer {
      if (!staticHistoryMultiplexer) {
        if (!context.serverRequest) {
          throw new Error(
            'Static history can not be created without a server request.'
          );
        }

        staticHistoryMultiplexer = new HistoryMultiplexer(
          history.createMemoryHistory({
            initialEntries: [createPathFromUrl(context.serverRequest.url)],
            initialIndex: 0,
          }),
          rootLocationTransformer
        );
      }

      return staticHistoryMultiplexer;
    },
  };
}

function createPathFromUrl(url: string): Partial<history.Path> {
  if (isAbsolute(url)) {
    const {pathname, search} = new URL(url);

    return {pathname, search};
  }

  return history.parsePath(url);
}

function isAbsolute(url: string): boolean {
  return /^https?:\/\//.test(url);
}
