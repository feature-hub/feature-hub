import * as history from 'history';
import {RootLocationTransformer} from './root-location-transformer';

export interface ConsumerHistory extends history.History {
  destroy(): void;
}

export interface ConsumerHistoryIndices {
  [consumerId: string]: number | undefined;
}

export abstract class BaseHistory implements ConsumerHistory {
  protected readonly consumerHistory: history.MemoryHistory;
  protected readonly unregisterCallbacks: history.UnregisterCallback[] = [];

  public constructor(
    protected readonly consumerId: string,
    protected readonly rootHistory: history.History,
    private readonly rootLocationTransformer: RootLocationTransformer
  ) {
    this.consumerHistory = history.createMemoryHistory();

    const initialConsumerPath = rootLocationTransformer.getConsumerPathFromRootLocation(
      rootHistory.location,
      consumerId
    );

    this.consumerHistory = history.createMemoryHistory({
      initialEntries: initialConsumerPath ? [initialConsumerPath] : undefined
    });
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
    const rootLocation = this.rootLocationTransformer.createRootLocation(
      consumerLocation,
      this.rootHistory.location,
      this.consumerId
    );

    const state = this.rootHistory.location.state as ConsumerHistoryIndices;
    const index = consumerLocation ? this.consumerHistory.index : -1;

    const newState: ConsumerHistoryIndices = {
      ...state,
      [this.consumerId]: index
    };

    return history.createLocation(rootLocation, newState);
  }

  protected getConsumerHistoryIndexFromRootHistory(): number {
    const state = this.rootHistory.location.state as ConsumerHistoryIndices;
    const index = state && state[this.consumerId];

    return typeof index === 'undefined' ? -1 : index;
  }

  protected persistConsumerLocation(
    consumerLocation: history.Location,
    method: 'push' | 'replace'
  ): void {
    this.consumerHistory[method](consumerLocation);
    this.rootHistory[method](this.createRootLocation(consumerLocation));
  }
}
