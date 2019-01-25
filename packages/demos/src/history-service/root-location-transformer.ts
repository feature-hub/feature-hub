import {RootLocationTransformer} from '@feature-hub/history-service';
import {createPath} from 'history';
import {URLSearchParams} from './url-search-params';

export const rootLocationTransformer: RootLocationTransformer = {
  getConsumerPathFromRootLocation: (rootLocation, consumerUid) => {
    const searchParams = new URLSearchParams(rootLocation.search);

    return searchParams.get(consumerUid) || undefined;
  },

  createRootLocation: (consumerLocation, rootLocation, consumerUid) => {
    const searchParams = new URLSearchParams(rootLocation.search);

    if (consumerLocation) {
      searchParams.set(consumerUid, createPath(consumerLocation));
    } else {
      searchParams.delete(consumerUid);
    }

    const {pathname, state} = rootLocation;

    return {
      pathname,
      search: searchParams.toString(),
      state
    };
  }
};
