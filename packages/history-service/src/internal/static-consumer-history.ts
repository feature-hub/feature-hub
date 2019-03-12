import * as history from 'history';
import {ConsumerHistory} from './consumer-history';

export class StaticConsumerHistory extends ConsumerHistory {
  public listen(): history.UnregisterCallback {
    this.context.logger.warn('history.listen() is not supported.');

    return () => undefined;
  }
}
