import * as history from 'history';
import {ConsumerHistory} from './consumer-history';

export class StaticConsumerHistory extends ConsumerHistory {
  public listen(): history.UnregisterCallback {
    console.warn('history.listen() is not supported.');

    return () => undefined;
  }
}
