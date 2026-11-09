import {appendExposedModule} from '../internal/append-exposed-module';

describe('appendExposedModule', () => {
  it('returns the URL unchanged without an exposed module', () => {
    expect(appendExposedModule('http://example.com/remotes/', undefined)).toBe(
      'http://example.com/remotes/',
    );
  });

  it('returns the URL unchanged for an empty exposed module', () => {
    expect(appendExposedModule('http://example.com/remotes/', '')).toBe(
      'http://example.com/remotes/',
    );
  });

  it('appends the exposed module as the URL fragment', () => {
    expect(
      appendExposedModule('http://example.com/remotes/', 'feature/one'),
    ).toBe('http://example.com/remotes/#feature/one');
  });

  it('throws when the URL already has a fragment', () => {
    expect(() =>
      appendExposedModule(
        'http://example.com/remotes/#feature/two',
        'feature/one',
      ),
    ).toThrow(
      'Cannot apply the exposedModule "feature/one" to the URL "http://example.com/remotes/#feature/two", which already has a fragment. Use one or the other.',
    );
  });
});
