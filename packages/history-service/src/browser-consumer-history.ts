import equal from 'fast-deep-equal';
import * as history from 'history';
import {ConsumerHistory} from './consumer-history';

export class BrowserConsumerHistory extends ConsumerHistory {
  private readonly listeners = new Set<history.LocationListener>();
  private readonly unregisterCallbacks: history.UnregisterCallback[] = [];

  public destroy(): void {
    this.unregisterCallbacks.forEach(unregister => unregister());
    this.rootHistory.replace(this.createRootLocation(undefined));
  }

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
      listener(this.consumerLocation, this.action);
    }
  }

  private handlePop(): void {
    const consumerPath = this.getConsumerPathFromRootHistory();
    const consumerState = this.getConsumerLocationStateFromRootHistory();

    if (this.matchesConsumerLocation(consumerPath, consumerState)) {
      return;
    }

    this.consumerLocation = this.createConsumerLocation(
      consumerPath,
      consumerState
    );

    this.action = 'POP';

    this.notifyListeners();
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
