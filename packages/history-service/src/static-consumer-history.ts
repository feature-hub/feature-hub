import * as history from 'history';
import {ConsumerHistory} from './consumer-history';

export class StaticConsumerHistory extends ConsumerHistory {
  public get length(): number {
    return 1;
  }

  public listen(
    _listener: history.LocationListener
  ): history.UnregisterCallback {
    console.warn('history.listen() is not supported.');

    return () => undefined;
  }
}
