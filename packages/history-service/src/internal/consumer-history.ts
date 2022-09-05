import * as history from 'history';
import * as historyV4 from '../history-v4';
import {createHistoryPath} from './create-history-path';
import {HistoryMultiplexer} from './history-multiplexer';
import {HistoryServiceContext} from './history-service-context';

export abstract class ConsumerHistory implements historyV4.History {
  public action: historyV4.Action = 'POP';
  public location: historyV4.Location;

  public constructor(
    protected readonly context: HistoryServiceContext,
    protected readonly historyKey: string,
    protected readonly historyMultiplexer: HistoryMultiplexer
  ) {
    const {
      pathname,
      search,
      hash,
      state,
    } = historyMultiplexer.getConsumerLocation(historyKey);

    this.location = {
      pathname: pathname.startsWith('/') ? pathname : `/${pathname}`,
      search,
      hash,
      state,
    };

    /**
     * The methods of `history.History` must be bound explicitly, because
     * components like `Link` from the `react-router-dom` package deconstruct
     * methods like `push` and `replace` from the `history`.
     */
    this.push = this.push.bind(this);
    this.replace = this.replace.bind(this);
    this.go = this.go.bind(this);
    this.goBack = this.goBack.bind(this);
    this.goForward = this.goForward.bind(this);
    this.block = this.block.bind(this);
    this.createHref = this.createHref.bind(this);
  }

  public get length(): number {
    return typeof window === 'undefined' ? 1 : window.history.length;
  }

  public abstract listen(
    listener: historyV4.LocationListener
  ): historyV4.UnregisterCallback;

  public push(
    pathOrLocation: historyV4.LocationDescriptor,
    state?: historyV4.LocationState
  ): void {
    this.location = {
      ...createHistoryPath(pathOrLocation, this.location.pathname),
      state,
    };

    this.historyMultiplexer.push(this.historyKey, this.location);
    this.action = 'PUSH';
  }

  public replace(
    pathOrLocation: historyV4.LocationDescriptor,
    state?: historyV4.LocationState
  ): void {
    this.location = {
      ...createHistoryPath(pathOrLocation, this.location.pathname),
      state,
    };

    this.historyMultiplexer.replace(this.historyKey, this.location);
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

  public block(): historyV4.UnregisterCallback {
    this.context.logger.warn('history.block() is not supported.');

    return () => undefined;
  }

  public createHref(
    location: historyV4.LocationDescriptorObject
  ): historyV4.Href {
    return this.historyMultiplexer.createHref(
      this.historyKey,
      createHistoryPath(location, history.createPath(this.location))
    );
  }
}
