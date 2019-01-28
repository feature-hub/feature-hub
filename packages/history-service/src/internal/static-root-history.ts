import {ServerRequestV0} from '@feature-hub/server-request';
import * as history from 'history';
import {RootHistory, RootLocation} from './history-multiplexer';

export class StaticRootHistory implements RootHistory {
  public readonly length = 1;
  public location: history.Location;

  public constructor(serverRequest: ServerRequestV0) {
    this.location = history.createLocation(serverRequest.url);
  }

  /* istanbul ignore next */
  public listen(): () => void {
    return () => undefined;
  }

  public push(location: RootLocation): void {
    this.location = history.createLocation(location);
  }

  public replace(location: RootLocation): void {
    this.location = history.createLocation(location);
  }

  public createHref(location: RootLocation): history.Href {
    return history.createPath(location);
  }
}
