import {ServerRequestV1} from '@feature-hub/server-request';
import * as history from 'history';
import {createHistoryPath} from './create-history-path';
import {RootHistoryForHistoryMultiplexer} from './history-multiplexer';
import {URL} from './url';

function isAbsolute(url: string): boolean {
  return /^https?:\/\//.test(url);
}

export class StaticRootHistory implements RootHistoryForHistoryMultiplexer {
  public readonly length = 1;
  public location: history.Location;

  public constructor(serverRequest: ServerRequestV1) {
    if (isAbsolute(serverRequest.url)) {
      const {pathname, search} = new URL(serverRequest.url);
      this.location = this.createLocation({pathname, search});
    } else {
      this.location = this.createLocation(history.parsePath(serverRequest.url));
    }
  }

  /* istanbul ignore next */
  public listen(): () => void {
    return () => undefined;
  }

  public push(location: Partial<history.Path>): void {
    this.location = this.createLocation(location);
  }

  public replace(location: Partial<history.Path>): void {
    this.location = this.createLocation(location);
  }

  public createHref(location: Partial<history.Path>): string {
    return history.createPath(location);
  }

  private createLocation(location: Partial<history.Path>): history.Location {
    return {...createHistoryPath(location), state: {}, key: ''};
  }
}
