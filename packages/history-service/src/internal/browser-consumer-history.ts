import equal from 'fast-deep-equal';
import * as history from 'history';
import {ConsumerHistory} from './consumer-history';
import type {HistoryMultiplexer} from './history-multiplexer';
import type {HistoryServiceContext} from './history-service-context';

export class BrowserConsumerHistory extends ConsumerHistory {
  private readonly listeners = new Set<history.Listener>();
  private readonly unregisterCallbacks: (() => void)[] = [];
  private readonly browserUnregister: () => void;

  public constructor(
    context: HistoryServiceContext,
    historyKey: string,
    historyMultiplexer: HistoryMultiplexer,
  ) {
    super(context, historyKey, historyMultiplexer);

    this.browserUnregister = historyMultiplexer.listenForRootLocationChange(
      (action) => {
        this.handleRootLocationChange(action);
      },
    );

    this.listen = this.listen.bind(this);
    this.push = this.push.bind(this);
    this.replace = this.replace.bind(this);
  }

  public destroy(): void {
    this.browserUnregister();
    // biome-ignore lint/suspicious/useIterableCallbackReturn: unregister callbacks are intentionally invoked for side effects
    this.unregisterCallbacks.forEach((unregister) => unregister());
  }

  public listen(listener: history.Listener): () => void {
    this.listeners.add(listener);

    const unregister = () => {
      this.listeners.delete(listener);
    };

    this.unregisterCallbacks.push(unregister);

    return unregister;
  }

  public push(to: history.To, state?: unknown): void {
    super.push(to, state);
    this.notifyListeners();
  }

  public replace(to: history.To, state?: unknown): void {
    super.replace(to, state);
    this.notifyListeners();
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener({location: this.location, action: this.action});
    }
  }

  private handleRootLocationChange(action: history.Action): void {
    const location = this.historyMultiplexer.getConsumerLocation(
      this.historyKey,
    );

    if (this.matches(location)) {
      return;
    }

    this.location = location;
    this.action = action;

    this.notifyListeners();
  }

  private matches(location: history.Location): boolean {
    if (history.createPath(location) !== history.createPath(this.location)) {
      return false;
    }

    return equal(location.state, this.location.state);
  }
}
