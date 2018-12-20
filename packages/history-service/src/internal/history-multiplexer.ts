import * as history from 'history';
import {RootLocationTransformer} from '../create-root-location-transformer';

export interface ConsumerHistoryStates {
  readonly [consumerId: string]: unknown;
}

export type RootLocation = history.Location<ConsumerHistoryStates>;

export interface RootHistory {
  readonly length: number;
  readonly location: RootLocation;

  push(location: RootLocation): void;
  replace(location: RootLocation): void;
  createHref(location: RootLocation): string;
  listen(listener: history.LocationListener): history.UnregisterCallback;
}

export class HistoryMultiplexer {
  public constructor(
    private readonly rootHistory: RootHistory,
    private readonly rootLocationTransformer: RootLocationTransformer
  ) {}

  public get length(): number {
    return this.rootHistory.length;
  }

  public get rootLocation(): RootLocation {
    return this.rootHistory.location;
  }

  public push(consumerId: string, consumerLocation: history.Location): void {
    this.rootHistory.push(
      this.createRootLocation(consumerId, consumerLocation)
    );
  }

  public replace(
    consumerId: string,
    consumerLocation: history.Location | undefined
  ): void {
    this.rootHistory.replace(
      this.createRootLocation(consumerId, consumerLocation)
    );
  }

  public createHref(
    consumerId: string,
    consumerLocation: history.Location
  ): history.Href {
    return this.rootHistory.createHref(
      this.createRootLocation(consumerId, consumerLocation)
    );
  }

  public getConsumerLocation(consumerId: string): history.Location {
    const consumerPath =
      this.rootLocationTransformer.getConsumerPathFromRootLocation(
        this.rootHistory.location,
        consumerId
      ) || '/';

    const consumerStates = this.rootHistory.location.state;
    const consumerState = consumerStates && consumerStates[consumerId];

    return history.createLocation(consumerPath, consumerState);
  }

  public listenForPop(listener: () => void): () => void {
    return this.rootHistory.listen((_location, action) => {
      if (action === 'POP') {
        listener();
      }
    });
  }

  private createRootLocation(
    consumerId: string,
    consumerLocation: history.Location | undefined
  ): history.Location {
    const rootLocation = this.rootLocationTransformer.createRootLocation(
      consumerLocation,
      this.rootHistory.location,
      consumerId
    );

    const consumerStates = this.rootHistory.location.state;
    const consumerState = consumerLocation && consumerLocation.state;

    const newConsumerStates: ConsumerHistoryStates = {
      ...consumerStates,
      [consumerId]: consumerState
    };

    return history.createLocation({...rootLocation, state: newConsumerStates});
  }
}
