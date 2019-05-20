import {Location} from 'history';
import {
  ConsumerLocation,
  RootLocationTransformer
} from '../create-root-location-transformer';
import {RootHistoryServiceV2} from '../define-history-service';

import {RootHistory} from './history-multiplexer';

export class RootHistoryServiceV2Impl implements RootHistoryServiceV2 {
  public constructor(
    private readonly history: RootHistory,
    private readonly rootLocationTransformer: RootLocationTransformer
  ) {}

  public get location(): Location {
    return this.history.location;
  }

  public push(location: Location): void {
    this.history.push(location);
  }
  public replace(location: Location): void {
    this.history.replace(location);
  }
  public createHref(location: Location): string {
    return this.history.createHref(location);
  }
  public createLocation(...consumerLocations: ConsumerLocation[]): Location {
    return this.rootLocationTransformer.createRootLocationForMultipleConsumers(
      ...consumerLocations
    );
  }
}
