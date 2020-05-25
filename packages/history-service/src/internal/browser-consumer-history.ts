import equal from 'fast-deep-equal';
import * as history from 'history';
import {ConsumerHistory} from './consumer-history';
import {HistoryMultiplexer} from './history-multiplexer';
import {HistoryServiceContext} from './history-service-context';

export class BrowserConsumerHistory extends ConsumerHistory {
  private readonly listeners = new Set<history.LocationListener>();
  private readonly unregisterCallbacks: history.UnregisterCallback[] = [];
  private readonly browserUnregister: () => void;

  public constructor(
    context: HistoryServiceContext,
    historyKey: string,
    historyMultiplexer: HistoryMultiplexer
  ) {
    super(context, historyKey, historyMultiplexer);

    this.browserUnregister = historyMultiplexer.listenForRootLocationChange(
      action => {
        this.handleRootLocationChange(action);
      }
    );
  }

  public destroy(): void {
    this.browserUnregister();
    this.unregisterCallbacks.forEach(unregister => unregister());
  }

  public listen(
    listener: history.LocationListener
  ): history.UnregisterCallback {
    this.listeners.add(listener);

    const unregister = () => {
      this.listeners.delete(listener);
    };

    this.unregisterCallbacks.push(unregister);

    return unregister;
  }

  public push(
    pathOrLocation: history.LocationDescriptor,
    state?: history.LocationState
  ): void {
    super.push(pathOrLocation, state);
    // this.notifyListeners();
  }

  public replace(
    pathOrLocation: history.LocationDescriptor,
    state?: history.LocationState
  ): void {
    super.replace(pathOrLocation, state);
    // this.notifyListeners();
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.location, this.action);
    }
  }

  private handleRootLocationChange(action: history.Action): void {
    const location = this.historyMultiplexer.getConsumerLocation(
      this.historyKey
    );

    if (this.matches(location)) {
      return;
    }

    this.location = location;
    this.action = action;

    this.notifyListeners();
  }

  private matches(location: history.Location): boolean {
    if (history.createPath(location) !== history.createPath(this.location)) {
      return false;
    }

    if (Boolean(location.hash)) {
      return false;
    }

    return equal(location.state, this.location.state);
  }
}
