import * as history from 'history';
import {
  ConsumerLocation,
  RootHistory,
  RootLocation,
  RootLocationDescriptorObject,
} from '..';
import {RootLocationTransformer} from '../create-root-location-transformer';
import * as historyV4 from '../history-v4';
import {createHistoryPath} from './create-history-path';
import {Writable} from './writable';

export interface RootHistoryForHistoryMultiplexer {
  readonly location: history.Location;
  createHref(location: Partial<history.Path>): string;
  push(location: Partial<history.Path>, state?: unknown): void;
  replace(location: Partial<history.Path>, state?: unknown): void;
  listen(listener: history.Listener): () => void;
}

export class HistoryMultiplexer {
  public rootHistoryV2: RootHistory;

  public constructor(
    public readonly rootHistory: RootHistoryForHistoryMultiplexer,
    public readonly rootLocationTransformer: RootLocationTransformer
  ) {
    this.rootHistoryV2 = {
      get length(): number {
        try {
          return window.history.length;
        } catch {
          return 1;
        }
      },

      get location(): RootLocation {
        return rootHistory.location as RootLocation;
      },

      push(location: RootLocationDescriptorObject): void {
        const {pathname, search, hash, state} = location;

        rootHistory.push({pathname, search, hash}, state);
      },

      replace(location: RootLocationDescriptorObject): void {
        const {pathname, search, hash, state} = location;

        rootHistory.replace({pathname, search, hash}, state);
      },

      createHref(location: RootLocationDescriptorObject): string {
        return rootHistory.createHref(location);
      },

      listen(
        listener: historyV4.LocationListener
      ): historyV4.UnregisterCallback {
        return rootHistory.listen(({location, action}) =>
          listener(location, action)
        );
      },
    };
  }

  public get rootLocation(): RootLocation {
    return this.rootHistory.location as RootLocation;
  }

  public push(
    historyKey: string,
    consumerLocation: Partial<history.Location>
  ): void {
    const {pathname, search, hash, state} = this.createRootLocation(
      historyKey,
      consumerLocation
    );

    this.rootHistory.push({pathname, search, hash}, state);
  }

  public replace(
    historyKey: string,
    consumerLocation: Partial<history.Location>
  ): void {
    const {pathname, search, hash, state} = this.createRootLocation(
      historyKey,
      consumerLocation
    );

    this.rootHistory.replace({pathname, search, hash}, state);
  }

  public createHref(
    historyKey: string,
    consumerLocation: Partial<history.Location>
  ): string {
    const {pathname, search, hash} = this.createRootLocation(
      historyKey,
      consumerLocation
    );

    return this.rootHistory.createHref({pathname, search, hash});
  }

  public getConsumerLocation(
    historyKey: string
  ): Omit<history.Location, 'key'> {
    const consumerPath =
      this.rootLocationTransformer.getConsumerPathFromRootLocation(
        this.rootLocation,
        historyKey
      ) || '/';

    const consumerStates = this.rootLocation.state;

    const consumerState =
      (consumerStates && consumerStates[historyKey]) || undefined;

    return {
      ...createHistoryPath(history.parsePath(consumerPath)),
      state: consumerState,
    };
  }

  public listenForRootLocationChange(
    listener: (action: history.Action) => void
  ): () => void {
    return this.rootHistory.listen((update) => {
      listener(update.action);
    });
  }

  public createNewRootLocationForMultipleConsumers(
    ...consumerLocations: ConsumerLocation[]
  ): RootLocationDescriptorObject {
    let newRootLocation: Partial<history.Path> = {pathname: '/'};

    if (
      this.rootLocationTransformer.createNewRootLocationForMultipleConsumers
    ) {
      newRootLocation = this.rootLocationTransformer.createNewRootLocationForMultipleConsumers(
        ...consumerLocations
      );
    } else {
      for (const consumerLocation of consumerLocations) {
        newRootLocation = this.rootLocationTransformer.createRootLocation(
          newRootLocation,
          consumerLocation.location,
          consumerLocation.historyKey
        );
      }
    }

    const state: Writable<Record<string, unknown>> = {};

    for (const {historyKey, location} of consumerLocations) {
      state[historyKey] = location.state;
    }

    return {...createHistoryPath(newRootLocation), state};
  }

  private createRootLocation(
    historyKey: string,
    consumerLocation: Partial<history.Location>
  ): RootLocation {
    const newRootLocation = this.rootLocationTransformer.createRootLocation(
      this.rootLocation,
      consumerLocation,
      historyKey
    );

    return {
      ...createHistoryPath(newRootLocation),
      state: {...this.rootLocation.state, [historyKey]: consumerLocation.state},
    };
  }
}
