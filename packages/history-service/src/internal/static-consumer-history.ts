import * as history from 'history';
import {ConsumerHistory} from './consumer-history';
import {HistoryMultiplexer} from './history-multiplexer';
import {HistoryServiceContext} from './history-service-context';

export class StaticConsumerHistory extends ConsumerHistory {
  public constructor(
    context: HistoryServiceContext,
    historyKey: string,
    historyMultiplexer: HistoryMultiplexer
  ) {
    super(context, historyKey, historyMultiplexer);

    this.listen = this.listen.bind(this);
  }

  public listen(): history.UnregisterCallback {
    this.context.logger.warn('history.listen() is not supported.');

    return () => undefined;
  }
}
