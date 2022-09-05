import * as historyV4 from '../history-v4';
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

  public listen(): historyV4.UnregisterCallback {
    this.context.logger.warn('history.listen() is not supported.');

    return () => undefined;
  }
}
