import {History} from 'history';
import {LocationDescriptorObject} from '../../history-v4';
import {createHistoryV4Adapter} from '../create-history-v4-adapter';

const ctx = {logger: console};
const history = {push: jest.fn(), replace: jest.fn()};
describe('createHistoryV4Adapter', () => {
  it('push fullPath', () => {
    const adapter = createHistoryV4Adapter(
      ctx,
      createHistory({pathname: '/xpath', search: '?xxx=2'}),
    );
    adapter.push('/path?test=tre');
    expect(history.push).toHaveBeenCalledWith('/path?test=tre', undefined);
  });
  it('push search', () => {
    const adapter = createHistoryV4Adapter(
      ctx,
      createHistory({pathname: '/path', search: '?xxx=2'}),
    );
    adapter.push('?test=true');
    expect(history.push).toHaveBeenCalledWith('/path?test=true', undefined);
  });
  it('push anchor', () => {
    const adapter = createHistoryV4Adapter(
      ctx,
      createHistory({pathname: '/path', search: '?test=true'}),
    );
    adapter.push('#test');
    expect(history.push).toHaveBeenCalledWith(
      '/path?test=true#test',
      undefined,
    );
  });
  it('replace fullPath', () => {
    const adapter = createHistoryV4Adapter(
      ctx,
      createHistory({pathname: '/xpath', search: '?testxx=true'}),
    );
    adapter.replace('/path?test=tre');
    expect(history.replace).toHaveBeenCalledWith('/path?test=tre', undefined);
  });
  it('replace search', () => {
    const adapter = createHistoryV4Adapter(
      ctx,
      createHistory({pathname: '/path', search: '?test=false'}),
    );
    adapter.replace('?test=true');
    expect(history.replace).toHaveBeenCalledWith('/path?test=true', undefined);
  });
  it('replace anchor', () => {
    const adapter = createHistoryV4Adapter(
      ctx,
      createHistory({pathname: '/path', search: '?test=true'}),
    );
    adapter.replace('#test');
    expect(history.replace).toHaveBeenCalledWith(
      '/path?test=true#test',
      undefined,
    );
  });
});
function createHistory(location: LocationDescriptorObject): History {
  return {...history, location} as unknown as History;
}
