/**
 * @jest-environment jsdom
 */

import {resolveRemoteFromManifest} from '../resolve-manifest';

type FetchMock = jest.MockedFunction<typeof fetch>;

/**
 * The manifest cache is keyed by URL and lives for the module's lifetime, so
 * each test uses its own URL rather than reaching into the cache to reset it.
 */
function manifestUrl(name: string): string {
  return `http://localhost:3000/remotes/${name}/mf-manifest.json`;
}

function createManifest(overrides: Record<string, unknown> = {}): unknown {
  return {
    name: 'feature_apps',
    metaData: {
      remoteEntry: {name: 'remoteEntry.js', path: '', type: 'module'},
      publicPath: '',
    },
    exposes: [{name: 'featureAppModuleOne'}, {name: 'feature/two'}],
    ...overrides,
  };
}

function mockManifestResponse(manifest: unknown): void {
  (global.fetch as FetchMock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => manifest,
  } as Response);
}

describe('resolveRemoteFromManifest', () => {
  beforeEach(() => {
    global.fetch = jest.fn() as FetchMock;
  });

  it('resolves the remote name, entry and entry type from the manifest', async () => {
    mockManifestResponse(createManifest());

    await expect(
      resolveRemoteFromManifest(manifestUrl('name'), 'feature/two'),
    ).resolves.toEqual({
      remoteName: 'feature_apps',
      remoteGlobalName: 'feature_apps',
      remoteEntryURL: 'http://localhost:3000/remotes/name/remoteEntry.js',
      remoteEntryType: 'module',
      exposedModule: 'feature/two',
    });
  });

  it('resolves the entry against an absolute public path', async () => {
    mockManifestResponse(
      createManifest({
        metaData: {
          remoteEntry: {name: 'remoteEntry.js', path: 'static', type: 'var'},
          publicPath: 'https://cdn.example.com/feature-apps/',
        },
      }),
    );

    await expect(
      resolveRemoteFromManifest(manifestUrl('cdn'), 'featureAppModuleOne'),
    ).resolves.toMatchObject({
      remoteEntryURL:
        'https://cdn.example.com/feature-apps/static/remoteEntry.js',
      remoteEntryType: 'var',
    });
  });

  it('resolves the entry next to the manifest for the `auto` public path', async () => {
    mockManifestResponse(
      createManifest({
        metaData: {
          remoteEntry: {name: 'remoteEntry.js', path: '', type: 'module'},
          publicPath: 'auto',
        },
      }),
    );

    await expect(
      resolveRemoteFromManifest(manifestUrl('auto'), 'featureAppModuleOne'),
    ).resolves.toMatchObject({
      remoteEntryURL: 'http://localhost:3000/remotes/auto/remoteEntry.js',
    });
  });

  it('fetches a given manifest only once', async () => {
    const url = manifestUrl('cached');

    mockManifestResponse(createManifest());

    const [first, second] = await Promise.all([
      resolveRemoteFromManifest(url, 'featureAppModuleOne'),
      resolveRemoteFromManifest(url, 'feature/two'),
    ]);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(first.exposedModule).toBe('featureAppModuleOne');
    expect(second.exposedModule).toBe('feature/two');
  });

  it('requires an exposed module even when the remote exposes only one', async () => {
    mockManifestResponse(
      createManifest({exposes: [{name: 'featureAppModule'}]}),
    );

    await expect(
      resolveRemoteFromManifest(manifestUrl('single')),
    ).rejects.toThrow(
      'No exposedModule was given for the remote "feature_apps" at "http://localhost:3000/remotes/single/mf-manifest.json". Exposed modules: featureAppModule.',
    );
  });

  it('requires an exposed module when the remote exposes several', async () => {
    mockManifestResponse(createManifest());

    await expect(
      resolveRemoteFromManifest(manifestUrl('unnamed')),
    ).rejects.toThrow(
      'No exposedModule was given for the remote "feature_apps" at "http://localhost:3000/remotes/unnamed/mf-manifest.json". Exposed modules: featureAppModuleOne, feature/two.',
    );
  });

  it('lists the exposed modules when the requested one is absent', async () => {
    mockManifestResponse(createManifest());

    await expect(
      resolveRemoteFromManifest(manifestUrl('absent'), 'feature/three'),
    ).rejects.toThrow(
      'The remote "feature_apps" at "http://localhost:3000/remotes/absent/mf-manifest.json" does not expose "feature/three". Exposed modules: featureAppModuleOne, feature/two.',
    );
  });

  it('throws when the remote exposes no modules', async () => {
    mockManifestResponse(createManifest({exposes: []}));

    await expect(
      resolveRemoteFromManifest(manifestUrl('empty'), 'featureAppModuleOne'),
    ).rejects.toThrow(
      'The remote "feature_apps" at "http://localhost:3000/remotes/empty/mf-manifest.json" exposes no modules, so there is nothing to load.',
    );
  });

  it('treats a manifest without exposes as exposing no modules', async () => {
    mockManifestResponse(createManifest({exposes: undefined}));

    await expect(
      resolveRemoteFromManifest(
        manifestUrl('no-exposes'),
        'featureAppModuleOne',
      ),
    ).rejects.toThrow(/exposes no modules/);
  });

  it('throws when the manifest declares no remote name', async () => {
    mockManifestResponse(createManifest({name: undefined}));

    await expect(
      resolveRemoteFromManifest(manifestUrl('nameless'), 'featureAppModuleOne'),
    ).rejects.toThrow(/does not declare a remote name/);
  });

  it('throws when the manifest declares no entry file', async () => {
    mockManifestResponse(createManifest({metaData: {publicPath: ''}}));

    await expect(
      resolveRemoteFromManifest(
        manifestUrl('entryless'),
        'featureAppModuleOne',
      ),
    ).rejects.toThrow(/does not declare an entry file/);
  });

  it('throws when the manifest computes its public path at runtime', async () => {
    mockManifestResponse(
      createManifest({
        metaData: {
          remoteEntry: {name: 'remoteEntry.js', path: '', type: 'module'},
          getPublicPath: 'function() { return window.cdn; }',
        },
      }),
    );

    await expect(
      resolveRemoteFromManifest(manifestUrl('runtime'), 'featureAppModuleOne'),
    ).rejects.toThrow(/computes its public path at runtime \(getPublicPath\)/);
  });

  it('throws when the manifest cannot be fetched', async () => {
    (global.fetch as FetchMock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    await expect(
      resolveRemoteFromManifest(manifestUrl('missing'), 'featureAppModuleOne'),
    ).rejects.toThrow(/the server responded with 404/);
  });

  it('throws when the network request fails', async () => {
    (global.fetch as FetchMock).mockRejectedValueOnce(new Error('offline'));

    await expect(
      resolveRemoteFromManifest(manifestUrl('offline'), 'featureAppModuleOne'),
    ).rejects.toThrow(
      /Could not fetch the Module Federation manifest.*offline/,
    );
  });

  it('throws when the manifest is not valid JSON', async () => {
    (global.fetch as FetchMock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('Unexpected token');
      },
    } as unknown as Response);

    await expect(
      resolveRemoteFromManifest(manifestUrl('invalid'), 'featureAppModuleOne'),
    ).rejects.toThrow(/is not valid JSON/);
  });

  it.each([
    ['null', null],
    ['an array', []],
    ['exposes that is not a list', createManifest({exposes: {}})],
    ['an expose entry without a name', createManifest({exposes: [null]})],
  ])('throws when the manifest is %s', async (description, manifest) => {
    const url = manifestUrl(`malformed-${description.replace(/\W+/g, '-')}`);

    mockManifestResponse(manifest);

    await expect(
      resolveRemoteFromManifest(url, 'featureAppModuleOne'),
    ).rejects.toThrow(
      `The Module Federation manifest at "${url}" is malformed: expected a JSON object whose \`exposes\` is a list of named modules.`,
    );
  });

  it('resolves the entry against a root-relative public path', async () => {
    mockManifestResponse(
      createManifest({
        metaData: {
          remoteEntry: {name: 'remoteEntry.js', path: '', type: 'module'},
          publicPath: '/static/feature-apps/',
        },
      }),
    );

    await expect(
      resolveRemoteFromManifest(
        manifestUrl('root-relative'),
        'featureAppModuleOne',
      ),
    ).resolves.toMatchObject({
      remoteEntryURL:
        'http://localhost:3000/static/feature-apps/remoteEntry.js',
    });
  });

  it('retries a failed manifest instead of caching the failure', async () => {
    const url = manifestUrl('retried');

    (global.fetch as FetchMock).mockRejectedValueOnce(new Error('offline'));

    await expect(
      resolveRemoteFromManifest(url, 'featureAppModuleOne'),
    ).rejects.toThrow(/offline/);

    mockManifestResponse(createManifest());

    await expect(
      resolveRemoteFromManifest(url, 'featureAppModuleOne'),
    ).resolves.toMatchObject({
      remoteName: 'feature_apps',
      exposedModule: 'featureAppModuleOne',
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
