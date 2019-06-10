import {AsyncValue} from './async-value';
import {ExternalsValidator} from './externals-validator';
import {
  FeatureServiceConsumerDefinition,
  FeatureServiceProviderDefinition,
  FeatureServiceRegistry,
  FeatureServices,
  SharedFeatureService
} from './feature-service-registry';
import {isFeatureAppModule} from './internal/is-feature-app-module';
import {Logger} from './logger';

export interface FeatureAppEnvironment<
  TFeatureServices extends FeatureServices,
  TConfig
> {
  /**
   * An object of required Feature Services that are semver-compatible with the
   * declared dependencies in the Feature App definition.
   */
  readonly featureServices: TFeatureServices;

  /**
   * A config object that is provided by the integrator.
   */
  readonly config: TConfig;

  /**
   * The ID that the integrator has assigned to the Feature App instance.
   */
  readonly featureAppId: string;

  /**
   * The absolute or relative base URL of the Feature App's assets and/or BFF.
   */
  readonly baseUrl: string | undefined;
}

export interface FeatureAppDefinition<
  TFeatureApp,
  TFeatureServices extends FeatureServices = FeatureServices,
  TConfig = unknown
> extends FeatureServiceConsumerDefinition {
  readonly ownFeatureServiceDefinitions?: FeatureServiceProviderDefinition<
    SharedFeatureService
  >[];

  create(env: FeatureAppEnvironment<TFeatureServices, TConfig>): TFeatureApp;
}

export type ModuleLoader = (url: string) => Promise<unknown>;

export interface FeatureAppScope<TFeatureApp> {
  readonly featureApp: TFeatureApp;

  destroy(): void;
}

export interface FeatureAppScopeOptions {
  /**
   * The absolute or relative base URL of the Feature App's assets and/or BFF.
   */
  readonly baseUrl?: string;

  /**
   * A config object that is intended for a specific Feature App instance.
   */
  readonly config?: unknown;

  /**
   * A callback that is called before the Feature App is created.
   */
  readonly beforeCreate?: (
    featureAppId: string,
    featureServices: FeatureServices
  ) => void;
}

/**
 * @deprecated Use [[FeatureAppManager]] instead.
 */
export type FeatureAppManagerLike = FeatureAppManager;

export interface FeatureAppManagerOptions {
  /**
   * For the `FeatureAppManager` to be able to load Feature Apps from a remote
   * location, a module loader must be provided, (e.g. the
   * `@feature-hub/module-loader-amd` package or the
   * `@feature-hub/module-loader-commonjs` package).
   */
  readonly moduleLoader?: ModuleLoader;

  /**
   * When using a [[moduleLoader]], it might make sense to validate
   * external dependencies that are required by Feature Apps against the
   * shared dependencies that are provided by the integrator. This makes it
   * possible that an error is already thrown when creating a Feature App with
   * incompatible external dependencies, and thus enables early feedback as to
   * whether a Feature App is compatible with the integration environment.
   */
  readonly externalsValidator?: ExternalsValidator;

  /**
   * A custom logger that shall be used instead of `console`.
   */
  readonly logger?: Logger;
}

type FeatureAppModuleUrl = string;
type FeatureAppId = string;

/**
 * The `FeatureAppManager` manages the lifecycle of Feature Apps.
 */
export class FeatureAppManager {
  private readonly asyncFeatureAppDefinitions = new Map<
    FeatureAppModuleUrl,
    AsyncValue<FeatureAppDefinition<unknown>>
  >();

  private readonly featureAppDefinitionsWithRegisteredOwnFeatureServices = new WeakSet<
    FeatureAppDefinition<unknown>
  >();

  private readonly featureAppScopes = new Map<
    FeatureAppId,
    FeatureAppScope<unknown>
  >();

  private readonly logger: Logger;

  public constructor(
    private readonly featureServiceRegistry: FeatureServiceRegistry,
    private readonly options: FeatureAppManagerOptions = {}
  ) {
    this.logger = options.logger || console;
  }

  /**
   * Load a [[FeatureAppDefinition]] using the module loader the
   * [[FeatureAppManager]] was initilized with.
   *
   * @throws Throws an error if no module loader was provided on initilization.
   *
   * @param url A URL pointing to a [[FeatureAppDefinition]] bundle in a
   * module format compatible with the module loader.
   *
   * @returns An [[AsyncValue]] containing a promise that resolves with the
   * loaded [[FeatureAppDefinition]]. If called again with the same URL it
   * returns the same [[AsyncValue]]. The promise rejects when loading
   * fails, or when the loaded bundle doesn't export a [[FeatureAppDefinition]]
   * as default.
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
   * Create a [[FeatureAppScope]] which includes validating externals,
   * binding all available Feature Service dependencies, and calling the
   * `create` method of the [[FeatureAppDefinition]].
   *
   * @throws Throws an error if Feature Services that the
   * [[FeatureAppDefinition]] provides with its `ownFeatureServices` key fail to
   * be registered.
   * @throws Throws an error if the required externals can't be satisfied.
   * @throws Throws an error if the required Feature Services can't be
   * satisfied.
   * @throws Throws an error the [[FeatureAppDefinition]]'s `create` method
   * throws.
   *
   * @param featureAppDefinition The definition of the Feature App to create a
   * scope for.
   *
   * @returns A [[FeatureAppScope]] for the provided [[FeatureAppDefinition]]
   * and ID specifier. If `getFeatureAppScope` is called
   * multiple times with the same [[FeatureAppDefinition]] and ID specifier,
   * it returns the [[FeatureAppScope]] it created on the first call.
   */
  public getFeatureAppScope<TFeatureApp>(
    featureAppId: string,
    featureAppDefinition: FeatureAppDefinition<TFeatureApp>,
    options: FeatureAppScopeOptions = {}
  ): FeatureAppScope<TFeatureApp> {
    let featureAppScope = this.featureAppScopes.get(featureAppId);

    if (!featureAppScope) {
      this.registerOwnFeatureServices(featureAppId, featureAppDefinition);

      featureAppScope = this.createFeatureAppScope(
        featureAppDefinition,
        featureAppId,
        () => this.featureAppScopes.delete(featureAppId),
        options
      );

      this.featureAppScopes.set(featureAppId, featureAppScope);
    }

    return featureAppScope as FeatureAppScope<TFeatureApp>;
  }

  /**
   * Preload a [[FeatureAppDefinition]] using the module loader the
   * [[FeatureAppManager]] was initilized with. Useful before hydration of a
   * server rendered page to avoid render result mismatch between client and
   * server due missing [[FeatureAppDefinition]]s.
   *
   * @throws Throws an error if no module loader was provided on initilization.
   *
   * @see [[getAsyncFeatureAppDefinition]] for further information.
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
            )} is invalid. A Feature App module must have a Feature App definition as default export. A Feature App definition is an object with at least a \`create\` method.`
          );
        }

        this.logger.info(
          `The Feature App module at the url ${JSON.stringify(
            url
          )} has been successfully loaded.`
        );

        return featureAppModule.default;
      })
    );
  }

  private registerOwnFeatureServices(
    featureAppId: string,
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
        featureAppId
      );
    }

    this.featureAppDefinitionsWithRegisteredOwnFeatureServices.add(
      featureAppDefinition
    );
  }

  private createFeatureAppScope<TFeatureApp>(
    featureAppDefinition: FeatureAppDefinition<TFeatureApp>,
    featureAppId: string,
    deleteFeatureAppScope: () => void,
    options: FeatureAppScopeOptions
  ): FeatureAppScope<TFeatureApp> {
    this.validateExternals(featureAppDefinition);

    const {baseUrl, beforeCreate, config} = options;

    const binding = this.featureServiceRegistry.bindFeatureServices(
      featureAppDefinition,
      featureAppId
    );

    if (beforeCreate) {
      beforeCreate(featureAppId, binding.featureServices);
    }

    const featureApp = featureAppDefinition.create({
      baseUrl,
      config,
      featureAppId,
      featureServices: binding.featureServices
    });

    this.logger.info(
      `The Feature App with the ID ${JSON.stringify(
        featureAppId
      )} has been successfully created.`
    );

    let destroyed = false;

    const destroy = () => {
      if (destroyed) {
        throw new Error(
          `The Feature App with the ID ${JSON.stringify(
            featureAppId
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
    const {externalsValidator} = this.options;

    if (!externalsValidator) {
      return;
    }

    const {dependencies} = featureAppDefinition;

    if (dependencies && dependencies.externals) {
      externalsValidator.validate(dependencies.externals);
    }
  }
}
