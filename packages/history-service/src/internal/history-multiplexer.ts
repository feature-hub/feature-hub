import * as history from 'history';
import {
  ConsumerLocationV3,
  RootHistory,
  RootLocation as RootLocationV2,
  RootLocationDescriptorObject,
} from '..';
import {RootLocationTransformer} from '../create-root-location-transformer';
import * as historyV4 from '../history-v4';
import {createHistoryPath} from './create-history-path';
import {createKey} from './create-key';

export interface RootLocation extends history.Location {
  readonly state: Record<string, ConsumerState> | undefined;
}

export interface ConsumerState {
  readonly state: unknown;
  readonly key: string;
}

export class HistoryMultiplexer {
  public rootHistoryV2: RootHistory;

  public constructor(
    public readonly rootHistory: history.History,
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

      get location(): RootLocationV2 {
        return rootHistory.location as RootLocationV2;
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

  public push(historyKey: string, consumerLocation: history.Location): void {
    const {pathname, search, hash, state} = this.createRootLocation(
      historyKey,
      consumerLocation
    );

    this.rootHistory.push({pathname, search, hash}, state);
  }

  public replace(historyKey: string, consumerLocation: history.Location): void {
    const {pathname, search, hash, state} = this.createRootLocation(
      historyKey,
      consumerLocation
    );

    this.rootHistory.replace({pathname, search, hash}, state);
  }

  public createHref(
    historyKey: string,
    consumerLocation: history.Path
  ): string {
    const {pathname, search, hash} = this.createRootLocation(
      historyKey,
      consumerLocation
    );

    return this.rootHistory.createHref({pathname, search, hash});
  }

  public getConsumerLocation(historyKey: string): history.Location {
    const consumerPath =
      this.rootLocationTransformer.getConsumerPathFromRootLocation(
        this.rootLocation,
        historyKey
      ) || '/';

    const {state, key} = this.rootLocation.state?.[historyKey] || {
      state: undefined,
      key: createKey(),
    };

    return {
      ...createHistoryPath(history.parsePath(consumerPath)),
      state,
      key,
    };
  }

  public listenForRootLocationChange(
    listener: (action: history.Action) => void
  ): () => void {
    return this.rootHistory.listen(({action}) => {
      listener(action);
    });
  }

  public createNewRootLocationForMultipleConsumers(
    ...consumerLocations: ConsumerLocationV3[]
  ): Omit<RootLocation, 'key'> {
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

    const consumerStates: Record<string, ConsumerState> = {};

    for (const {historyKey, state} of consumerLocations) {
      consumerStates[historyKey] = {state, key: createKey()};
    }

    return {...createHistoryPath(newRootLocation), state: consumerStates};
  }

  private createRootLocation(
    historyKey: string,
    consumerLocation: Partial<history.Location>
  ): Omit<RootLocation, 'key'> {
    const newRootLocation = this.rootLocationTransformer.createRootLocation(
      this.rootLocation,
      consumerLocation,
      historyKey
    );

    const {state, key = createKey()} = consumerLocation;

    return {
      ...createHistoryPath(newRootLocation),
      state: {...this.rootLocation.state, [historyKey]: {state, key}},
    };
  }
}
