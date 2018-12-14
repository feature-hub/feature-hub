import * as history from 'history';
import {RootLocationTransformer} from '.';
import {ConsumerHistory} from './base-history';
import {BrowserHistory} from './browser-history';
import {RootHistories} from './root-histories';

export interface HistoryServiceV1 {
  createBrowserHistory(): history.History;
}

export class HistoryService implements HistoryServiceV1 {
  public constructor(
    private readonly rootHistories: RootHistories,
    private readonly rootLocationTransformer: RootLocationTransformer,
    private readonly consumerId: string,
    private readonly consumerHistories: ConsumerHistory[]
  ) {}

  public createBrowserHistory(): history.History {
    return this.registerConsumerHistory(
      new BrowserHistory(
        this.consumerId,
        this.rootHistories.browserHistory,
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
