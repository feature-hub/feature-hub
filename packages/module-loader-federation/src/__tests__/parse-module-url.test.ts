import {parseModuleUrl} from '../parse-module-url';

describe('parseModuleUrl', () => {
  describe('with a manifest URL', () => {
    it('takes the fragment as the exposed module', () => {
      expect(
        parseModuleUrl(
          'http://localhost:3000/remotes/mf-manifest.json#exposed-module-name',
        ),
      ).toEqual({
        manifestURL: 'http://localhost:3000/remotes/mf-manifest.json',
        exposedModule: 'exposed-module-name',
      });
    });

    it('keeps a multi-segment fragment whole', () => {
      expect(
        parseModuleUrl(
          'http://localhost:3000/remotes/mf-manifest.json#feature/two',
        ),
      ).toEqual({
        manifestURL: 'http://localhost:3000/remotes/mf-manifest.json',
        exposedModule: 'feature/two',
      });
    });

    it('leaves the exposed module undefined when there is no fragment', () => {
      expect(
        parseModuleUrl('http://localhost:3000/remotes/mf-manifest.json'),
      ).toEqual({
        manifestURL: 'http://localhost:3000/remotes/mf-manifest.json',
        exposedModule: undefined,
      });
    });

    it('leaves the exposed module undefined for an empty fragment', () => {
      expect(
        parseModuleUrl('http://localhost:3000/remotes/mf-manifest.json#'),
      ).toEqual({
        manifestURL: 'http://localhost:3000/remotes/mf-manifest.json',
        exposedModule: undefined,
      });
    });

    it('accepts any *.json path, not just mf-manifest.json', () => {
      expect(
        parseModuleUrl(
          'http://localhost:3000/remotes/custom-manifest.json#exposed-module-name',
        ),
      ).toEqual({
        manifestURL: 'http://localhost:3000/remotes/custom-manifest.json',
        exposedModule: 'exposed-module-name',
      });
    });

    it('keeps a query string on the manifest URL', () => {
      expect(
        parseModuleUrl(
          'http://localhost:3000/remotes/mf-manifest.json?v=42#exposed-module-name',
        ),
      ).toEqual({
        manifestURL: 'http://localhost:3000/remotes/mf-manifest.json?v=42',
        exposedModule: 'exposed-module-name',
      });
    });
  });

  describe('with a folder URL', () => {
    it('appends mf-manifest.json to a folder with a trailing slash', () => {
      expect(
        parseModuleUrl('http://localhost:3000/remotes/#exposed-module-name'),
      ).toEqual({
        manifestURL: 'http://localhost:3000/remotes/mf-manifest.json',
        exposedModule: 'exposed-module-name',
      });
    });

    it('appends mf-manifest.json to a folder without a trailing slash', () => {
      expect(
        parseModuleUrl('http://localhost:3000/remotes#exposed-module-name'),
      ).toEqual({
        manifestURL: 'http://localhost:3000/remotes/mf-manifest.json',
        exposedModule: 'exposed-module-name',
      });
    });

    it.each([
      'http://localhost:3000/feature-app/1.4.0/#featureAppModule',
      'http://localhost:3000/feature-app/1.4.0#featureAppModule',
    ])('treats a folder with a dot in its name as a folder: %s', (url) => {
      expect(parseModuleUrl(url)).toEqual({
        manifestURL: 'http://localhost:3000/feature-app/1.4.0/mf-manifest.json',
        exposedModule: 'featureAppModule',
      });
    });

    it('treats any other non-.json path as a folder', () => {
      expect(
        parseModuleUrl(
          'http://localhost:3000/remotes/remoteEntry.js#featureAppModule',
        ),
      ).toEqual({
        manifestURL:
          'http://localhost:3000/remotes/remoteEntry.js/mf-manifest.json',
        exposedModule: 'featureAppModule',
      });
    });

    it('appends mf-manifest.json to an origin-only URL', () => {
      expect(
        parseModuleUrl('http://localhost:3000#exposed-module-name'),
      ).toEqual({
        manifestURL: 'http://localhost:3000/mf-manifest.json',
        exposedModule: 'exposed-module-name',
      });
    });

    it('keeps a query string after the appended manifest name', () => {
      expect(
        parseModuleUrl(
          'http://localhost:3000/remotes?v=42#exposed-module-name',
        ),
      ).toEqual({
        manifestURL: 'http://localhost:3000/remotes/mf-manifest.json?v=42',
        exposedModule: 'exposed-module-name',
      });
    });
  });

  describe('rejection cases', () => {
    it('throws for an empty URL', () => {
      expect(() => parseModuleUrl('')).toThrow(
        /Cannot parse empty federated module URL/,
      );
    });

    it('throws for a non-absolute URL', () => {
      expect(() => parseModuleUrl('feature-app.federated.js')).toThrow(
        'Malformed Module Federation remote URL "feature-app.federated.js": expected an absolute URL to an MF2 manifest (e.g. <origin>/remotes/mf-manifest.json) or to the folder that holds it (e.g. <origin>/remotes/).',
      );
    });
  });
});
