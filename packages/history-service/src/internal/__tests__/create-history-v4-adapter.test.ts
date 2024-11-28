import {History} from 'history';
import {createHistoryV4Adapter} from '../create-history-v4-adapter';

const ctx = {logger: console};
const history = {push: jest.fn(), replace: jest.fn()};
describe('createHistoryV4Adapter', () => {
  const cases = [
    {
      desc: 'full-path',
      arg: '/new-path?test=true',
      expected: '/new-path?test=true',
    },
    {desc: 'search', arg: '?test=true', expected: '/path?test=true'},
    {desc: 'fragment', arg: '#test', expected: '/path?test=false#test'},
  ];

  let adapter: ReturnType<typeof createHistoryV4Adapter>;
  beforeEach(() => {
    adapter = createHistoryV4Adapter(ctx, {
      ...history,
      location: {pathname: '/path', search: '?test=false'},
    } as unknown as History);
  });

  it.each(cases)('push $desc', ({arg, expected}) => {
    adapter.push(arg);
    expect(history.push).toHaveBeenCalledWith(expected, undefined);
  });

  it.each(cases)('replace $desc', ({arg, expected}) => {
    adapter.replace(arg);
    expect(history.replace).toHaveBeenCalledWith(expected, undefined);
  });
});
