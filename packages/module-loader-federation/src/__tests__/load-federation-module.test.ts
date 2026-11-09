/**
 * @jest-environment jsdom
 */

jest.mock('@module-federation/enhanced/runtime', () => ({
  registerRemotes: jest.fn(),
  loadRemote: jest.fn(),
}));

import {loadRemote, registerRemotes} from '@module-federation/enhanced/runtime';
import {loadFederationModule} from '../load-federation-module';

const mockedRegisterRemotes = registerRemotes as jest.MockedFunction<
  typeof registerRemotes
>;
const mockedLoadRemote = loadRemote as jest.MockedFunction<typeof loadRemote>;

/**
 * The manifest cache is keyed by URL and lives for the module's lifetime, so
 * each test uses its own URL rather than reaching into the cache to reset it.
 */
function manifestUrl(name: string): string {
  return `http://localhost:3000/remotes/${name}/mf-manifest.json`;
}

function mockManifestResponse(overrides: Record<string, unknown> = {}): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      name: 'feature_apps',
      metaData: {
        remoteEntry: {name: 'remoteEntry.js', path: '', type: 'module'},
        publicPath: '',
      },
      exposes: [{name: 'featureAppModuleOne'}, {name: 'feature/two'}],
      ...overrides,
    }),
  }) as jest.MockedFunction<typeof fetch>;
}

/** The name each `registerRemotes` call registered its remote under. */
function registeredNames(): string[] {
  return mockedRegisterRemotes.mock.calls.map(([[remote]]) => remote.name);
}

describe('loadFederationModule', () => {
  beforeEach(() => {
    mockedRegisterRemotes.mockReset();
    mockedLoadRemote.mockReset().mockResolvedValue({});
  });

  it('registers the remote from the manifest and loads the exposed module', async () => {
    const featureAppModule = {default: {create: jest.fn()}};

    mockManifestResponse();
    mockedLoadRemote.mockResolvedValueOnce(featureAppModule);

    const module = await loadFederationModule(
      `${manifestUrl('registered')}#feature/two`,
    );

    const [name] = registeredNames();

    expect(name).toMatch(/^feature_apps@[0-9a-f]+$/);
    expect(mockedRegisterRemotes).toHaveBeenCalledWith([
      {
        name,
        entry: 'http://localhost:3000/remotes/registered/remoteEntry.js',
        entryGlobalName: 'feature_apps',
        type: 'module',
      },
    ]);
    expect(mockedLoadRemote).toHaveBeenCalledWith(`${name}/feature/two`);
    expect(module).toBe(featureAppModule);
  });

  it('passes the global name the manifest declares to the runtime', async () => {
    mockManifestResponse({
      metaData: {
        remoteEntry: {name: 'remoteEntry.js', path: '', type: 'var'},
        publicPath: '',
        globalName: 'feature_apps_global',
      },
    });

    await loadFederationModule(`${manifestUrl('global')}#featureAppModuleOne`);

    expect(mockedRegisterRemotes).toHaveBeenCalledWith([
      expect.objectContaining({
        entryGlobalName: 'feature_apps_global',
        type: 'var',
      }),
    ]);
  });

  it('registers Feature Apps from the same remote under one name', async () => {
    mockManifestResponse();

    await loadFederationModule(`${manifestUrl('shared')}#featureAppModuleOne`);
    await loadFederationModule(`${manifestUrl('shared')}#feature/two`);

    const [first, second] = registeredNames();

    expect(second).toBe(first);
    expect(mockedLoadRemote.mock.calls).toEqual([
      [`${first}/featureAppModuleOne`],
      [`${first}/feature/two`],
    ]);
  });

  it('registers remotes built with the same name from different entries apart', async () => {
    mockManifestResponse();

    await loadFederationModule(`${manifestUrl('team-a')}#featureAppModuleOne`);
    await loadFederationModule(`${manifestUrl('team-b')}#featureAppModuleOne`);

    const [first, second] = registeredNames();

    expect(first).toMatch(/^feature_apps@/);
    expect(second).toMatch(/^feature_apps@/);
    expect(second).not.toBe(first);
    expect(mockedLoadRemote.mock.calls).toEqual([
      [`${first}/featureAppModuleOne`],
      [`${second}/featureAppModuleOne`],
    ]);
  });

  it('lets the moduleType argument override the manifest entry type', async () => {
    mockManifestResponse();

    await loadFederationModule(
      `${manifestUrl('overridden')}#featureAppModuleOne`,
      'var',
    );

    expect(mockedRegisterRemotes).toHaveBeenCalledWith([
      expect.objectContaining({
        entry: 'http://localhost:3000/remotes/overridden/remoteEntry.js',
        type: 'var',
      }),
    ]);
  });

  it('loads from the manifest in a folder URL', async () => {
    mockManifestResponse();

    await loadFederationModule(
      'http://localhost:3000/remotes/folder/#featureAppModuleOne',
    );

    expect(global.fetch).toHaveBeenCalledWith(manifestUrl('folder'));
    expect(mockedLoadRemote).toHaveBeenCalledWith(
      `${registeredNames()[0]}/featureAppModuleOne`,
    );
  });

  it('does not register a remote when no exposed module is given', async () => {
    mockManifestResponse({exposes: [{name: 'featureAppModule'}]});

    await expect(loadFederationModule(manifestUrl('unnamed'))).rejects.toThrow(
      /No exposedModule was given/,
    );

    expect(mockedRegisterRemotes).not.toHaveBeenCalled();
    expect(mockedLoadRemote).not.toHaveBeenCalled();
  });

  it('does not register a remote when the exposed module is absent', async () => {
    mockManifestResponse();

    await expect(
      loadFederationModule(`${manifestUrl('unexposed')}#feature/three`),
    ).rejects.toThrow(/does not expose "feature\/three"/);

    expect(mockedRegisterRemotes).not.toHaveBeenCalled();
    expect(mockedLoadRemote).not.toHaveBeenCalled();
  });

  it('rejects when the runtime fails to load the remote', async () => {
    mockManifestResponse();
    mockedLoadRemote.mockRejectedValueOnce(new Error('boom'));

    await expect(
      loadFederationModule(`${manifestUrl('failing')}#featureAppModuleOne`),
    ).rejects.toThrow('boom');
  });
});
