import * as history from 'history';
import {HistoryMultiplexer} from './history-multiplexer';

export abstract class ConsumerHistory implements history.History {
  public action: history.Action = 'POP';
  public location: history.Location;

  public constructor(
    protected readonly consumerUid: string,
    protected readonly historyMultiplexer: HistoryMultiplexer
  ) {
    this.location = history.createLocation(
      historyMultiplexer.getConsumerLocation(consumerUid),
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
    this.location = history.createLocation(
      pathOrLocation,
      state,
      undefined,
      this.location
    );

    this.historyMultiplexer.push(this.consumerUid, this.location);
    this.action = 'PUSH';
  }

  public replace(
    pathOrLocation: history.LocationDescriptor,
    state?: history.LocationState
  ): void {
    this.location = history.createLocation(
      pathOrLocation,
      state,
      undefined,
      this.location
    );

    this.historyMultiplexer.replace(this.consumerUid, this.location);
    this.action = 'REPLACE';
  }

  public go(): void {
    console.warn('history.go() is not supported.');
  }

  public goBack(): void {
    console.warn('history.goBack() is not supported.');
  }

  public goForward(): void {
    console.warn('history.goForward() is not supported.');
  }

  public block(): history.UnregisterCallback {
    console.warn('history.block() is not supported.');

    return () => undefined;
  }

  public createHref(location: history.LocationDescriptorObject): history.Href {
    return this.historyMultiplexer.createHref(
      this.consumerUid,
      history.createLocation(location, undefined, undefined, this.location)
    );
  }
}
