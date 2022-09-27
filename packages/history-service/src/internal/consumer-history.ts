import * as history from 'history';
import {createHistoryPath} from './create-history-path';
import {createKey} from './create-key';
import {HistoryMultiplexer} from './history-multiplexer';
import {HistoryServiceContext} from './history-service-context';

export abstract class ConsumerHistory implements history.History {
  public action: history.Action = history.Action.Pop;
  public location: history.Location;

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
      key,
    } = historyMultiplexer.getConsumerLocation(historyKey);

    this.location = {
      pathname: pathname.startsWith('/') ? pathname : `/${pathname}`,
      search,
      hash,
      state,
      key,
    };

    /**
     * The methods of `history.History` must be bound explicitly, because
     * components like `Link` from the `react-router-dom` package deconstruct
     * methods like `push` and `replace` from the `history`.
     */
    this.push = this.push.bind(this);
    this.replace = this.replace.bind(this);
    this.go = this.go.bind(this);
    this.back = this.back.bind(this);
    this.forward = this.forward.bind(this);
    this.block = this.block.bind(this);
    this.createHref = this.createHref.bind(this);
  }

  public abstract listen(listener: history.Listener): () => void;

  public push(to: history.To, state?: unknown): void {
    this.location = this.createLocation(to, state);
    this.historyMultiplexer.push(this.historyKey, this.location);
    this.action = history.Action.Push;
  }

  public replace(to: history.To, state?: unknown): void {
    this.location = this.createLocation(to, state);
    this.historyMultiplexer.replace(this.historyKey, this.location);
    this.action = history.Action.Replace;
  }

  public go(): void {
    this.context.logger.warn('history.go() is not supported.');
  }

  public back(): void {
    this.context.logger.warn('history.back() is not supported.');
  }

  public forward(): void {
    this.context.logger.warn('history.forward() is not supported.');
  }

  public block(): () => void {
    this.context.logger.warn('history.block() is not supported.');

    return () => undefined;
  }

  public createHref(to: history.To): string {
    return this.historyMultiplexer.createHref(
      this.historyKey,
      createHistoryPath(to, history.createPath(this.location))
    );
  }

  private createLocation(to: history.To, state?: unknown): history.Location {
    return {
      ...createHistoryPath(to, this.location.pathname),
      state,
      key: createKey(),
    };
  }
}
