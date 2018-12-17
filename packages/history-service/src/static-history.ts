import {ServerRequest} from '@feature-hub/server-renderer';
import * as history from 'history';
import {BaseHistory} from './base-history';
import {ConsumerHistoryStates} from './root-histories';

/* istanbul ignore next */
const noop = () => undefined;

export class StaticRootHistory
  implements history.History<ConsumerHistoryStates> {
  public action: history.Action = 'POP';
  public length = 1;
  public location: history.Location;
  public go = noop;
  public goBack = noop;
  public goForward = noop;

  public constructor(serverRequest: ServerRequest) {
    this.location = history.createLocation(serverRequest.path);
  }

  /* istanbul ignore next */
  public block = () => noop;

  /* istanbul ignore next */
  public listen = () => noop;

  public push(
    pathOrLocation: history.LocationDescriptor,
    state?: ConsumerHistoryStates
  ): void {
    this.location = history.createLocation(pathOrLocation, state);
    this.action = 'PUSH';
  }

  public replace(
    pathOrLocation: history.LocationDescriptor,
    state?: ConsumerHistoryStates
  ): void {
    this.location = history.createLocation(pathOrLocation, state);
    this.action = 'REPLACE';
  }

  public createHref(location: history.LocationDescriptorObject): history.Href {
    return history.createPath(location);
  }
}

export class StaticHistory extends BaseHistory {
  public get length(): number {
    return 1;
  }

  public listen(
    _listener: history.LocationListener
  ): history.UnregisterCallback {
    console.warn('history.listen() is not supported.');

    return () => undefined;
  }
}
