import equal from 'fast-deep-equal';
import * as history from 'history';
import {BaseHistory} from './base-history';

export class BrowserHistory extends BaseHistory {
  public get length(): number {
    return this.rootHistory.length;
  }

  public listen(
    listener: history.LocationListener
  ): history.UnregisterCallback {
    this.listeners.add(listener);

    const browserUnregister = this.rootHistory.listen((_location, action) => {
      if (action === 'POP') {
        this.handlePop();
      }
    });

    const unregister = () => {
      this.listeners.delete(listener);
      browserUnregister();
    };

    this.unregisterCallbacks.push(unregister);

    return unregister;
  }

  private handlePop(): void {
    const consumerPath = this.getConsumerPathFromRootHistory();
    const consumerState = this.getConsumerLocationStateFromRootHistory();

    if (this.matchesConsumerLocation(consumerPath, consumerState)) {
      return;
    }

    this.updateConsumerLocation(
      history.createLocation(consumerPath, consumerState),
      'POP'
    );
  }

  private matchesConsumerLocation(
    consumerPath: string,
    consumerState: unknown
  ): boolean {
    if (consumerPath !== history.createPath(this.consumerLocation)) {
      return false;
    }

    return equal(consumerState, this.consumerLocation.state);
  }
}
