import * as history from 'history';
import {BaseHistory} from './base-history';
import {RootLocationTransformer} from './root-location-transformer';

export class BrowserHistory extends BaseHistory {
  private readonly sessionStorageKey = `s2:history:${this.consumerId}`;

  public constructor(
    consumerId: string,
    rootHistory: history.History,
    rootLocationTransformer: RootLocationTransformer
  ) {
    super(consumerId, rootHistory, rootLocationTransformer);

    const index = this.getConsumerHistoryIndexFromRootHistory();

    if (index >= 0) {
      this.restoreConsumerHistoryEntries();
    } else {
      this.persistConsumerLocation(this.consumerHistory.location, 'replace');
      this.consumerHistory.action = 'POP';
    }
  }

  public listen(
    listener: history.LocationListener
  ): history.UnregisterCallback {
    const consumerUnregister = this.consumerHistory.listen(listener);

    const browserUnregister = this.rootHistory.listen((_location, action) => {
      if (action === 'POP') {
        this.popConsumerLocationMatchingIndexInRootHistory();
      }
    });

    const unregister = () => {
      consumerUnregister();
      browserUnregister();
    };

    this.unregisterCallbacks.push(unregister);

    return unregister;
  }

  protected persistConsumerLocation(
    consumerLocation: history.Location,
    method: 'push' | 'replace'
  ): void {
    super.persistConsumerLocation(consumerLocation, method);
    this.storeConsumerHistoryEntries();
  }

  private storeConsumerHistoryEntries(): void {
    // TODO: use session storage feature service
    window.sessionStorage.setItem(
      this.sessionStorageKey,
      JSON.stringify(this.consumerHistory.entries)
    );
  }

  private restoreConsumerHistoryEntries(): void {
    // TODO: use session storage feature service
    const storedConsumerHistoryEntries = window.sessionStorage.getItem(
      this.sessionStorageKey
    );

    const consumerHistoryEntries =
      storedConsumerHistoryEntries &&
      (JSON.parse(storedConsumerHistoryEntries) as history.Location[]);

    if (!consumerHistoryEntries) {
      console.warn(
        `Can not find stored consumer history entries in session storage for consumer "${
          this.consumerId
        }".`
      );

      return;
    }

    for (const [i, location] of consumerHistoryEntries.entries()) {
      if (i === 0) {
        this.consumerHistory.replace(location);
      } else {
        this.consumerHistory.push(location);
      }
    }

    this.popConsumerLocationMatchingIndexInRootHistory();
  }

  private popConsumerLocationMatchingIndexInRootHistory(): void {
    const index = this.getConsumerHistoryIndexFromRootHistory();
    const n = index - this.consumerHistory.index;

    // We use the memory history go() method, which mimics the behaviour
    // of a POP action best.
    if (n !== 0) {
      /* istanbul ignore else */
      if (this.consumerHistory.canGo(n)) {
        this.consumerHistory.go(n);
      } else {
        console.error(
          `Inconsistent consumer history for "${
            this.consumerId
          }". Can not apply popstate event for root location:`,
          this.rootHistory.location,
          'and consumer history entries:',
          this.consumerHistory.entries
        );
      }
    }
  }
}
