import {ServerRequest} from '@feature-hub/async-ssr-manager';
import * as history from 'history';
import {RootLocationTransformer} from '../create-root-location-transformer';
import {HistoryMultiplexer} from './history-multiplexer';
import {StaticRootHistory} from './static-root-history';

export interface HistoryMultiplexers {
  readonly browserHistoryMultiplexer: HistoryMultiplexer;
  readonly staticHistoryMultiplexer: HistoryMultiplexer;
}

export function createHistoryMultiplexers(
  rootLocationTransformer: RootLocationTransformer,
  serverRequest?: ServerRequest
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
        if (!serverRequest) {
          throw new Error(
            'Static history can not be created without a server request.'
          );
        }

        staticHistoryMultiplexer = new HistoryMultiplexer(
          new StaticRootHistory(serverRequest),
          rootLocationTransformer
        );
      }

      return staticHistoryMultiplexer;
    }
  };
}
