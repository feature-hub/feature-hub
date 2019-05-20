import {createBrowserHistory} from 'history';
import {createRootLocationTransformer} from '..';
import {RootHistoryServiceV2Impl} from '../internal/root-history-service';

const location = {
  pathname: '/home',
  search: '?state=3',
  hash: '#pp',
  state: {}
};

describe('#createHref', () => {
  it('just delegates to history', () => {
    const history = new RootHistoryServiceV2Impl(
      createBrowserHistory(),
      createRootLocationTransformer({consumerPathsQueryParamName: '---'})
    );

    const href = history.createHref(location);
    expect(href).toEqual('/home?state=3#pp');
  });
});

describe('#push', () => {
  it('just delegates to history', () => {
    const rootHistory = createBrowserHistory();
    const history = new RootHistoryServiceV2Impl(
      rootHistory,
      createRootLocationTransformer({consumerPathsQueryParamName: '---'})
    );

    history.push(location);
    expect(rootHistory.location).toMatchObject(location);
  });
});

describe('#replace', () => {
  it('just delegates to history', () => {
    const rootHistory = createBrowserHistory();
    const history = new RootHistoryServiceV2Impl(
      rootHistory,
      createRootLocationTransformer({consumerPathsQueryParamName: '---'})
    );

    history.replace(location);
    expect(rootHistory.location).toMatchObject(location);
  });
});
