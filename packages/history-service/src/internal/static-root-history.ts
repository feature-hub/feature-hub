import {ServerRequestV1} from '@feature-hub/server-request';
import * as history from 'history';
import {RootHistory} from '..';
import {
  RootLocation,
  RootLocationDescriptorObject
} from '../create-root-location-transformer';
import {URL} from './url';

function isAbsolute(url: string): boolean {
  return /^https?:\/\//.test(url);
}

export class StaticRootHistory implements RootHistory {
  public readonly length = 1;
  public location: RootLocation;

  public constructor(serverRequest: ServerRequestV1) {
    if (isAbsolute(serverRequest.url)) {
      const {pathname, search} = new URL(serverRequest.url);
      this.location = history.createLocation({pathname, search});
    } else {
      this.location = history.createLocation(serverRequest.url);
    }
  }

  /* istanbul ignore next */
  public listen(): () => void {
    return () => undefined;
  }

  public push(location: RootLocationDescriptorObject): void {
    this.location = history.createLocation(location);
  }

  public replace(location: RootLocationDescriptorObject): void {
    this.location = history.createLocation(location);
  }

  public createHref(location: RootLocationDescriptorObject): history.Href {
    return history.createPath(location);
  }
}
