import {ServerRequest} from '@feature-hub/server-renderer';
import * as history from 'history';
import {RootHistory, RootLocation} from './history-multiplexer';

export class StaticRootHistory implements RootHistory {
  public readonly length = 1;
  public location: history.Location;

  public constructor(serverRequest: ServerRequest) {
    this.location = history.createLocation(serverRequest.path);
  }

  /* istanbul ignore next */
  public listen = () => () => undefined;

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
