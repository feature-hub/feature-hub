import * as history from 'history';
import {ConsumerHistoryStates} from './root-histories';
import {RootLocationTransformer} from './root-location-transformer';

export abstract class ConsumerHistory implements history.History {
  public action: history.Action = 'POP';

  protected consumerLocation: history.Location;

  public constructor(
    protected readonly consumerId: string,
    protected readonly rootHistory: history.History<ConsumerHistoryStates>,
    protected readonly rootLocationTransformer: RootLocationTransformer
  ) {
    const consumerPath = this.getConsumerPathFromRootHistory();
    const consumerState = this.getConsumerLocationStateFromRootHistory();

    this.consumerLocation = this.createConsumerLocation(
      consumerPath,
      consumerState,
      history.createLocation('/')
    );
  }

  public abstract get length(): number;

  public abstract listen(
    listener: history.LocationListener
  ): history.UnregisterCallback;

  public get location(): history.Location {
    return this.consumerLocation;
  }

  public push(
    pathOrLocation: history.LocationDescriptor,
    state?: history.LocationState
  ): void {
    this.consumerLocation = this.createConsumerLocation(pathOrLocation, state);
    this.rootHistory.push(this.createRootLocation(this.consumerLocation));
    this.action = 'PUSH';
  }

  public replace(
    pathOrLocation: history.LocationDescriptor,
    state?: history.LocationState
  ): void {
    this.consumerLocation = this.createConsumerLocation(pathOrLocation, state);
    this.rootHistory.replace(this.createRootLocation(this.consumerLocation));
    this.action = 'REPLACE';
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

  public createHref(location: history.LocationDescriptorObject): history.Href {
    const consumerLocation = this.createConsumerLocation(location);

    return this.rootHistory.createHref(
      this.createRootLocation(consumerLocation)
    );
  }

  protected createConsumerLocation(
    pathOrLocation: history.LocationDescriptor,
    state?: history.LocationState,
    currentLocation: history.Location = this.consumerLocation
  ): history.Location {
    return history.createLocation(
      pathOrLocation,
      state,
      undefined,
      currentLocation
    );
  }

  protected createRootLocation(
    consumerLocation: history.Location | undefined
  ): history.LocationDescriptorObject {
    const rootLocation = this.rootLocationTransformer.createRootLocation(
      consumerLocation,
      this.rootHistory.location,
      this.consumerId
    );

    const state = this.rootHistory.location.state;
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
    const state = this.rootHistory.location.state;

    return state && state[this.consumerId];
  }
}
