import * as history from 'history';
import {RootLocationTransformer} from '.';
import {ConsumerHistory} from './base-history';
import {BrowserHistory} from './browser-history';
import {MemoryHistory} from './memory-history';
import {RootHistories} from './root-histories';

export interface HistoryServiceV1 {
  readonly rootLocation?: history.Location;
  createBrowserHistory(): history.History;
  createMemoryHistory(): history.MemoryHistory;
}

export class HistoryService implements HistoryServiceV1 {
  public constructor(
    private readonly rootHistories: RootHistories,
    private readonly rootLocationTransformer: RootLocationTransformer,
    private readonly consumerId: string,
    private readonly consumerHistories: ConsumerHistory[]
  ) {}

  public get rootLocation(): history.Location | undefined {
    return this.rootHistories.memoryHistory.location;
  }

  public createBrowserHistory(): history.History {
    return this.registerConsumerHistory(
      new BrowserHistory(
        this.consumerId,
        this.rootHistories.browserHistory,
        this.rootLocationTransformer
      )
    );
  }

  public createMemoryHistory(): history.MemoryHistory {
    return this.registerConsumerHistory(
      new MemoryHistory(
        this.consumerId,
        this.rootHistories.memoryHistory,
        this.rootLocationTransformer
      )
    );
  }

  private registerConsumerHistory<TConsumerHistory extends ConsumerHistory>(
    consumerHistory: TConsumerHistory
  ): TConsumerHistory {
    this.consumerHistories.push(consumerHistory);

    return consumerHistory;
  }
}
