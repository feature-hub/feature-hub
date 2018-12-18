import equal from 'fast-deep-equal';
import * as history from 'history';
import {ConsumerHistory} from './consumer-history';

export class BrowserConsumerHistory extends ConsumerHistory {
  private readonly listeners = new Set<history.LocationListener>();
  private readonly unregisterCallbacks: history.UnregisterCallback[] = [];

  public destroy(): void {
    this.unregisterCallbacks.forEach(unregister => unregister());
    this.historyMultiplexer.replace(this.consumerId, undefined);
  }

  public listen(
    listener: history.LocationListener
  ): history.UnregisterCallback {
    this.listeners.add(listener);

    // TODO: register in constructor
    const browserUnregister = this.historyMultiplexer.listenForPop(() => {
      this.handlePop();
    });

    const unregister = () => {
      this.listeners.delete(listener);
      browserUnregister();
    };

    this.unregisterCallbacks.push(unregister);

    return unregister;
  }

  public push(
    pathOrLocation: history.LocationDescriptor,
    state?: history.LocationState
  ): void {
    super.push(pathOrLocation, state);
    this.notifyListeners();
  }

  public replace(
    pathOrLocation: history.LocationDescriptor,
    state?: history.LocationState
  ): void {
    super.replace(pathOrLocation, state);
    this.notifyListeners();
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.location, this.action);
    }
  }

  private handlePop(): void {
    const location = this.historyMultiplexer.getConsumerLocation(
      this.consumerId
    );

    if (this.matchesConsumerLocation(location)) {
      return;
    }

    this.location = location;
    this.action = 'POP';

    this.notifyListeners();
  }

  private matchesConsumerLocation(location: history.Location): boolean {
    if (history.createPath(location) !== history.createPath(this.location)) {
      return false;
    }

    return equal(location.state, this.location.state);
  }
}
