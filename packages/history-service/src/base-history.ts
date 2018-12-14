import * as history from 'history';
import {RootLocationTransformer} from './root-location-transformer';

export interface ConsumerHistory extends history.History {
  destroy(): void;
}

export interface ConsumerHistoryStates {
  readonly [consumerId: string]: unknown;
}

export abstract class BaseHistory implements ConsumerHistory {
  public action: history.Action = 'POP';

  protected consumerLocation: history.Location;
  protected readonly listeners = new Set<history.LocationListener>();
  protected readonly unregisterCallbacks: history.UnregisterCallback[] = [];

  public constructor(
    protected readonly consumerId: string,
    protected readonly rootHistory: history.History,
    protected readonly rootLocationTransformer: RootLocationTransformer
  ) {
    const consumerPath = this.getConsumerPathFromRootHistory();
    const consumerState = this.getConsumerLocationStateFromRootHistory();

    this.consumerLocation = history.createLocation(consumerPath, consumerState);
  }

  public abstract get length(): number;

  public get location(): history.Location {
    return this.consumerLocation;
  }

  public push(
    pathOrLocation: history.LocationDescriptor,
    state?: history.LocationState
  ): void {
    const consumerLocation = history.createLocation(pathOrLocation, state);
    this.rootHistory.push(this.createRootLocation(consumerLocation));
    this.updateConsumerLocation(consumerLocation, 'PUSH');
  }

  public replace(
    pathOrLocation: history.LocationDescriptor,
    state?: history.LocationState
  ): void {
    const consumerLocation = history.createLocation(pathOrLocation, state);
    this.rootHistory.replace(this.createRootLocation(consumerLocation));
    this.updateConsumerLocation(consumerLocation, 'REPLACE');
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
    _prompt?: boolean | string | history.TransitionPromptHook
  ): history.UnregisterCallback {
    console.warn('history.block() is not supported.');

    return () => undefined;
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

    const state = this.rootHistory.location.state as ConsumerHistoryStates;
    const consumerState = consumerLocation && consumerLocation.state;

    const newState: ConsumerHistoryStates = {
      ...state,
      [this.consumerId]: consumerState
    };

    return history.createLocation(rootLocation, newState);
  }

  protected getConsumerPathFromRootHistory(): string {
    return (
      this.rootLocationTransformer.getConsumerPathFromRootLocation(
        this.rootHistory.location,
        this.consumerId
      ) || '/'
    );
  }

  protected getConsumerLocationStateFromRootHistory(): unknown {
    const state = this.rootHistory.location.state as ConsumerHistoryStates;

    return state && state[this.consumerId];
  }

  protected updateConsumerLocation(
    consumerLocation: history.Location,
    action: history.Action
  ): void {
    this.consumerLocation = consumerLocation;
    this.action = action;

    for (const listener of this.listeners) {
      listener(consumerLocation, action);
    }
  }
}
