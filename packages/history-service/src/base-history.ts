import * as history from 'history';
import {RootLocationTransformer} from './root-location-transformer';

export interface ConsumerHistory extends history.History {
  destroy(): void;
}

export abstract class BaseHistory implements ConsumerHistory {
  protected readonly consumerHistory: history.MemoryHistory;
  protected readonly unregisterCallbacks: history.UnregisterCallback[] = [];

  public constructor(
    protected readonly consumerId: string,
    protected readonly rootHistory: history.History,
    private readonly rootLocationTransformer: RootLocationTransformer
  ) {
    const initialConsumerPath = this.getConsumerPathFromRootLocation(
      rootHistory.location
    );

    this.consumerHistory = history.createMemoryHistory({
      initialEntries: initialConsumerPath ? [initialConsumerPath] : undefined
    });

    // Set the root history key for the initial consumer location.
    this.setRootHistoryKey(this.consumerHistory.location);
  }

  public get length(): number {
    return this.consumerHistory.length;
  }

  public get action(): history.Action {
    return this.consumerHistory.action;
  }

  public get location(): history.Location {
    return this.consumerHistory.location;
  }

  public push(
    pathOrLocation: history.LocationDescriptor,
    state?: history.LocationState
  ): void {
    const consumerLocation = history.createLocation(pathOrLocation, state);

    this.persistConsumerLocation(consumerLocation, 'push');
  }

  public replace(
    pathOrLocation: history.LocationDescriptor,
    state?: history.LocationState
  ): void {
    const consumerLocation = history.createLocation(pathOrLocation, state);

    this.persistConsumerLocation(consumerLocation, 'replace');
  }

  public go(_n: number): void {
    console.warn('history.go() is not supported.');
  }

  public goBack(): void {
    console.warn('history.goBack() is not supported.');
  }

  public goForward(): void {
    console.warn('history.goForward() is not supported.');
  }

  public block(
    prompt?: boolean | string | history.TransitionPromptHook
  ): history.UnregisterCallback {
    return this.consumerHistory.block(prompt);
  }

  public abstract listen(
    listener: history.LocationListener
  ): history.UnregisterCallback;

  public createHref(location: history.LocationDescriptorObject): history.Href {
    const consumerLocation = history.createLocation(location);

    return this.rootHistory.createHref(
      this.createRootLocation(consumerLocation)
    );
  }

  public destroy(): void {
    this.unregisterCallbacks.forEach(unregister => unregister());
    this.rootHistory.replace(this.createRootLocation(undefined));
  }

  protected createRootLocation(
    consumerLocation: history.Location | undefined
  ): history.LocationDescriptorObject {
    return this.rootLocationTransformer.createRootLocation(
      consumerLocation,
      this.rootHistory.location,
      this.consumerId
    );
  }

  // This method is only used in the BrowserHistory. It still lives in the
  // BaseHistory class though, since the rootHistoryKey is set here as well
  // on the any-typed consumer location state.
  protected belongsToRootLocation(
    rootLocation: history.Location
  ): (consumerLocation: history.Location, index: number) => boolean {
    return (consumerLocation: history.Location, index: number): boolean => {
      /* istanbul ignore next */
      if (!rootLocation.key || !consumerLocation.state) {
        console.error(
          `Invalid consumer history for "${this.consumerId}". The ${index +
            1}. location
          } has no rootHistoryKey set in its state.`,
          this.consumerHistory.entries
        );

        return false;
      }

      return consumerLocation.state.rootHistoryKey === rootLocation.key;
    };
  }

  private persistConsumerLocation(
    consumerLocation: history.Location,
    method: 'push' | 'replace'
  ): void {
    this.rootHistory[method](this.createRootLocation(consumerLocation));
    this.setRootHistoryKey(consumerLocation);
    this.consumerHistory[method](consumerLocation);
  }

  private getConsumerPathFromRootLocation(
    location: history.Location
  ): string | undefined {
    return this.rootLocationTransformer.getConsumerPathFromRootLocation(
      location,
      this.consumerId
    );
  }

  private setRootHistoryKey(consumerLocation: history.Location): void {
    consumerLocation.state = {
      ...consumerLocation.state,
      rootHistoryKey: this.rootHistory.location.key
    };
  }
}
