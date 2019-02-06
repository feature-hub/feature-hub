import {AsyncValue} from './async-value';
import {ExternalsValidatorLike} from './externals-validator';
import {
  FeatureServiceConsumerDefinition,
  FeatureServiceProviderDefinition,
  FeatureServiceRegistryLike,
  FeatureServices,
  SharedFeatureService
} from './feature-service-registry';
import {createUid} from './internal/create-uid';
import {isFeatureAppModule} from './internal/is-feature-app-module';

export interface FeatureAppEnvironment<
  TConfig,
  TFeatureServices extends FeatureServices
> {
  /**
   * A Feature App config object that is provided by the integrator.
   */
  readonly config: TConfig;

  /**
   * An object of required Feature Services that are semver-compatible with the
   * declared dependencies in the Feature App definition.
   */
  readonly featureServices: TFeatureServices;

  /**
   * An optional ID specifier that distinguishes the Feature App instance from
   * other Feature App instances with the same ID.
   */
  readonly idSpecifier: string | undefined;
}

export interface FeatureAppDefinition<
  TFeatureApp,
  TConfig = unknown,
  TFeatureServices extends FeatureServices = FeatureServices
> extends FeatureServiceConsumerDefinition {
  readonly ownFeatureServiceDefinitions?: FeatureServiceProviderDefinition<
    SharedFeatureService
  >[];

  create(env: FeatureAppEnvironment<TConfig, TFeatureServices>): TFeatureApp;
}

export type ModuleLoader = (url: string) => Promise<unknown>;

export interface FeatureAppScope<TFeatureApp> {
  readonly featureApp: TFeatureApp;

  destroy(): void;
}

export interface FeatureAppConfigs {
  readonly [featureAppId: string]: unknown;
}

export interface FeatureAppManagerLike {
  getAsyncFeatureAppDefinition(
    url: string
  ): AsyncValue<FeatureAppDefinition<unknown>>;

  getFeatureAppScope<TFeatureApp>(
    featureAppDefinition: FeatureAppDefinition<TFeatureApp>,
    idSpecifier?: string
  ): FeatureAppScope<TFeatureApp>;

  preloadFeatureApp(url: string): Promise<void>;
}

export interface FeatureAppManagerOptions {
  readonly configs?: FeatureAppConfigs;
  readonly moduleLoader?: ModuleLoader;
}

type FeatureAppModuleUrl = string;
type FeatureAppUid = string;

/**
 * The `FeatureAppManager` manages the lifecycle of Feature Apps.
 */
export class FeatureAppManager implements FeatureAppManagerLike {
  private readonly asyncFeatureAppDefinitions = new Map<
    FeatureAppModuleUrl,
    AsyncValue<FeatureAppDefinition<unknown>>
  >();

  private readonly featureAppDefinitionsWithRegisteredOwnFeatureServices = new WeakSet<
    FeatureAppDefinition<unknown>
  >();

  private readonly featureAppScopes = new Map<
    FeatureAppUid,
    FeatureAppScope<unknown>
  >();

  public constructor(
    private readonly featureServiceRegistry: FeatureServiceRegistryLike,
    private readonly externalsValidator: ExternalsValidatorLike,
    private readonly options: FeatureAppManagerOptions = {}
  ) {}

  /**
   * Load a {@link FeatureAppDefinition} using the module loader the
   * {@link FeatureAppManager} was initilized with.
   *
   * @throws Throws an error if no module loader was provided on initilization.
   *
   * @param url A URL pointing to a {@link FeatureAppDefinition} bundle in a
   * module format compatible with the module loader.
   *
   * @returns An {@link AsyncValue} containing a promise that resolves with the
   * loaded {@link FeatureAppDefinition}. If called again with the same URL it
   * returns the same {@link AsyncValue}. The promise rejects when loading
   * fails, or when the loaded bundle doesn't export a {@link
   * FeatureAppDefinition} as default.
   */
  public getAsyncFeatureAppDefinition(
    url: string
  ): AsyncValue<FeatureAppDefinition<unknown>> {
    let asyncFeatureAppDefinition = this.asyncFeatureAppDefinitions.get(url);

    if (!asyncFeatureAppDefinition) {
      asyncFeatureAppDefinition = this.createAsyncFeatureAppDefinition(url);

      this.asyncFeatureAppDefinitions.set(url, asyncFeatureAppDefinition);
    }

    return asyncFeatureAppDefinition;
  }

  /**
   * Create a {@link FeatureAppScope} which includes validating externals,
   * binding all available Feature Service dependencies, and calling the
   * `create` method of the {@link FeatureAppDefinition}.
   *
   * @throws Throws an error if Feature Services that the {@link
   * FeatureAppDefinition} provides with its `ownFeatureServices` key fail to
   * be registered.
   * @throws Throws an error if the required externals can't be satisfied.
   * @throws Throws an error if the required Feature Services can't be
   * satisfied.
   * @throws Throws an error the {@link FeatureAppDefinition}'s `create` method
   * throws.
   *
   * @param featureAppDefinition The definition of the Feature App to create a
   * scope for.
   * @param idSpecifier A specifier to distinguish the Feature App instances
   * from others created from the same definition.
   *
   * @returns A {@link FeatureAppScope} for the provided {@link
   * FeatureAppDefinition} and ID specifier. If `getFeatureAppScope` is called
   * multiple times with the same arguments, it returns the {@link
   * FeatureAppScope} it created on the first call.
   */
  public getFeatureAppScope<TFeatureApp>(
    featureAppDefinition: FeatureAppDefinition<TFeatureApp>,
    idSpecifier?: string
  ): FeatureAppScope<TFeatureApp> {
    const {id: featureAppId} = featureAppDefinition;
    const featureAppUid = createUid(featureAppId, idSpecifier);

    let featureAppScope = this.featureAppScopes.get(featureAppUid);

    if (!featureAppScope) {
      this.registerOwnFeatureServices(featureAppDefinition);

      const deleteFeatureAppScope = () =>
        this.featureAppScopes.delete(featureAppUid);

      featureAppScope = this.createFeatureAppScope(
        featureAppDefinition,
        idSpecifier,
        deleteFeatureAppScope
      );

      this.featureAppScopes.set(featureAppUid, featureAppScope);
    }

    return featureAppScope as FeatureAppScope<TFeatureApp>;
  }

  /**
   * Preload a {@link FeatureAppDefinition} using the module loader the {@link
   * FeatureAppManager} was initilized with. Useful before hydration of a
   * server rendered page to avoid render result mismatch between client and
   * server due missing {@link FeatureAppDefinition}s.
   *
   * @throws Throws an error if no module loader was provided on initilization.
   *
   * @see {@link getAsyncFeatureAppDefinition} for further information.
   */
  public async preloadFeatureApp(url: string): Promise<void> {
    await this.getAsyncFeatureAppDefinition(url).promise;
  }

  private createAsyncFeatureAppDefinition(
    url: string
  ): AsyncValue<FeatureAppDefinition<unknown>> {
    const {moduleLoader: loadModule} = this.options;

    if (!loadModule) {
      throw new Error('No module loader provided.');
    }

    return new AsyncValue(
      loadModule(url).then(featureAppModule => {
        if (!isFeatureAppModule(featureAppModule)) {
          throw new Error(
            `The Feature App module at the url ${JSON.stringify(
              url
            )} is invalid. A Feature App module must have a Feature App definition as default export. A Feature App definition is an object with at least an \`id\` string and a \`create\` method.`
          );
        }

        console.info(
          `The Feature App module at the url ${JSON.stringify(
            url
          )} has been successfully loaded.`
        );

        return featureAppModule.default;
      })
    );
  }

  private registerOwnFeatureServices(
    featureAppDefinition: FeatureAppDefinition<unknown>
  ): void {
    if (
      this.featureAppDefinitionsWithRegisteredOwnFeatureServices.has(
        featureAppDefinition
      )
    ) {
      return;
    }

    if (featureAppDefinition.ownFeatureServiceDefinitions) {
      this.featureServiceRegistry.registerFeatureServices(
        featureAppDefinition.ownFeatureServiceDefinitions,
        featureAppDefinition.id
      );
    }

    this.featureAppDefinitionsWithRegisteredOwnFeatureServices.add(
      featureAppDefinition
    );
  }

  private createFeatureAppScope<TFeatureApp>(
    featureAppDefinition: FeatureAppDefinition<TFeatureApp>,
    idSpecifier: string | undefined,
    deleteFeatureAppScope: () => void
  ): FeatureAppScope<TFeatureApp> {
    this.validateExternals(featureAppDefinition);

    const {configs} = this.options;
    const config = configs && configs[featureAppDefinition.id];
    const featureAppUid = createUid(featureAppDefinition.id, idSpecifier);

    const binding = this.featureServiceRegistry.bindFeatureServices(
      featureAppDefinition,
      idSpecifier
    );

    const featureApp = featureAppDefinition.create({
      config,
      featureServices: binding.featureServices,
      idSpecifier
    });

    console.info(
      `The Feature App ${JSON.stringify(
        featureAppUid
      )} has been successfully created.`
    );

    let destroyed = false;

    const destroy = () => {
      if (destroyed) {
        throw new Error(
          `The Feature App ${JSON.stringify(
            featureAppUid
          )} could not be destroyed.`
        );
      }

      deleteFeatureAppScope();
      binding.unbind();

      destroyed = true;
    };

    return {featureApp, destroy};
  }

  private validateExternals(
    featureAppDefinition: FeatureServiceConsumerDefinition
  ): void {
    const {dependencies} = featureAppDefinition;

    if (dependencies && dependencies.externals) {
      this.externalsValidator.validate(dependencies.externals);
    }
  }
}
