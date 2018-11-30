import * as history from 'history';
import {BaseHistory} from './base-history';

export class BrowserHistory extends BaseHistory {
  public listen(
    listener: history.LocationListener
  ): history.UnregisterCallback {
    const consumerUnregister = this.consumerHistory.listen(listener);

    const browserUnregister = this.rootHistory.listen(
      (rootLocation, action) => {
        if (action === 'POP') {
          this.handlePop(rootLocation);
        }
      }
    );

    const unregister = () => {
      consumerUnregister();
      browserUnregister();
    };

    this.unregisterCallbacks.push(unregister);

    return unregister;
  }

  private handlePop(rootLocation: history.Location): void {
    const consumerLocationIndex = this.consumerHistory.entries.findIndex(
      this.belongsToRootLocation(rootLocation)
    );

    if (consumerLocationIndex === -1) {
      return;
    }

    const n = consumerLocationIndex - this.consumerHistory.index;

    // We use the memory history go() method, which mimics the behaviour
    // of a POP action best.
    if (n !== 0) {
      /* istanbul ignore else */
      if (this.consumerHistory.canGo(n)) {
        this.consumerHistory.go(n);
      } else {
        console.error(
          `Inconsistent consumer history for "${
            this.consumerId
          }". Can not apply popstate event for location:`,
          rootLocation,
          this.consumerHistory.entries
        );
      }
    }
  }
}
