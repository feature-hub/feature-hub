import * as history from 'history';
import {HistoryMultiplexer} from './history-multiplexer';
import {HistoryServiceContext} from './history-service-context';

export abstract class ConsumerHistory implements history.History {
  public action: history.Action = 'POP';
  public location: history.Location;

  public constructor(
    protected readonly context: HistoryServiceContext,
    protected readonly historyKey: string,
    protected readonly historyMultiplexer: HistoryMultiplexer
  ) {
    this.location = history.createLocation(
      historyMultiplexer.getConsumerLocation(historyKey),
      undefined,
      undefined,
      history.createLocation('/')
    );
  }

  public get length(): number {
    return this.historyMultiplexer.length;
  }

  public abstract listen(
    listener: history.LocationListener
  ): history.UnregisterCallback;

  public push(
    pathOrLocation: history.LocationDescriptor,
    state?: history.LocationState
  ): void {
    const newLocation = history.createLocation(
      pathOrLocation,
      state,
      undefined,
      this.location
    );
    this.historyMultiplexer.push(this.historyKey, newLocation);
    this.location = newLocation;

    this.action = 'PUSH';
  }

  public replace(
    pathOrLocation: history.LocationDescriptor,
    state?: history.LocationState
  ): void {
    const newLocation = history.createLocation(
      pathOrLocation,
      state,
      undefined,
      this.location
    );
    this.historyMultiplexer.replace(this.historyKey, newLocation);

    this.location = newLocation;

    this.action = 'REPLACE';
  }

  public go(): void {
    this.context.logger.warn('history.go() is not supported.');
  }

  public goBack(): void {
    this.context.logger.warn('history.goBack() is not supported.');
  }

  public goForward(): void {
    this.context.logger.warn('history.goForward() is not supported.');
  }

  public block(): history.UnregisterCallback {
    this.context.logger.warn('history.block() is not supported.');

    return () => undefined;
  }

  public createHref(location: history.LocationDescriptorObject): history.Href {
    return this.historyMultiplexer.createHref(
      this.historyKey,
      history.createLocation(location, undefined, undefined, this.location)
    );
  }
}
