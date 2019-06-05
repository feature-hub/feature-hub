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
    consumerId: string,
    historyMultiplexer: HistoryMultiplexer
  ) {
    super(context, consumerId, historyMultiplexer);

    this.browserUnregister = historyMultiplexer.listenForPop(() => {
      this.handlePop();
    });
  }

  public destroy(): void {
    this.browserUnregister();
    this.unregisterCallbacks.forEach(unregister => unregister());
    this.historyMultiplexer.replace(this.consumerId, undefined);
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

    if (this.matches(location)) {
      return;
    }

    this.location = location;
    this.action = 'POP';

    this.notifyListeners();
  }

  private matches(location: history.Location): boolean {
    if (history.createPath(location) !== history.createPath(this.location)) {
      return false;
    }

    return equal(location.state, this.location.state);
  }
}
