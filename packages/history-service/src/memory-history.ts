import * as history from 'history';
import {BaseHistory} from './base-history';

export class MemoryHistory extends BaseHistory
  implements history.MemoryHistory {
  public get index(): number {
    return this.consumerHistory.index;
  }

  public get entries(): history.Location[] {
    return this.consumerHistory.entries;
  }

  public canGo(_n: number): boolean {
    console.warn('memoryHistory.canGo() is not supported.');

    return false;
  }

  public listen(
    listener: history.LocationListener
  ): history.UnregisterCallback {
    const unregister = this.consumerHistory.listen(listener);

    this.unregisterCallbacks.push(unregister);

    return unregister;
  }
}
