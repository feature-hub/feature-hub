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
  readonly config: TConfig | undefined;

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

  /**
   * When the `FeatureAppScope` is not needed anymore, e.g. the Feature App is
   * unmounted, `release` must be called. When all scopes for a Feature App ID
   * have been released, the Feature App instance is destroyed.
   */
  release(): void;
}

export interface FeatureAppScopeOptions<
  TFeatureServices extends FeatureServices,
  TConfig
> {
  /**
   * The absolute or relative base URL of the Feature App's assets and/or BFF.
   */
  readonly baseUrl?: string;

  /**
   * A config object that is intended for a specific Feature App instance.
   */
  readonly config?: TConfig;

  /**
   * A callback that is called before the Feature App is created.
   */
  readonly beforeCreate?: (
    env: FeatureAppEnvironment<TFeatureServices, TConfig>
  ) => void;
}

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

interface FeatureAppRetainer<TFeatureApp> {
  readonly featureApp: TFeatureApp;
  retain(): void;
  release(): void;
}

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

  private readonly featureAppRetainers = new Map<
    FeatureAppId,
    FeatureAppRetainer<unknown>
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
   * Create a [[FeatureAppScope]] which includes validating externals, binding
   * all available Feature Service dependencies, and calling the `create` method
   * of the [[FeatureAppDefinition]].
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
   * @param featureAppID The ID of the Feature App to create a scope for.
   * @param featureAppDefinition The definition of the Feature App to create a
   * scope for.
   *
   * @returns A [[FeatureAppScope]] for the provided Feature App ID and
   * [[FeatureAppDefinition]]. A new scope is created for every call of
   * `createFeatureAppScope`, even with the same ID and definiton.
   */
  public createFeatureAppScope<
    TFeatureApp,
    TFeatureServices extends FeatureServices = FeatureServices,
    TConfig = unknown
  >(
    featureAppId: string,
    featureAppDefinition: FeatureAppDefinition<
      TFeatureApp,
      TFeatureServices,
      TConfig
    >,
    options: FeatureAppScopeOptions<TFeatureServices, TConfig> = {}
  ): FeatureAppScope<TFeatureApp> {
    const featureAppRetainer = this.getFeatureAppRetainer<
      TFeatureApp,
      TFeatureServices,
      TConfig
    >(featureAppId, featureAppDefinition, options);

    let released = false;

    return {
      featureApp: featureAppRetainer.featureApp,

      release: () => {
        if (released) {
          this.logger.warn(
            `The Feature App with the ID ${JSON.stringify(
              featureAppId
            )} has already been released for this scope.`
          );
        } else {
          released = true;
          featureAppRetainer.release();
        }
      }
    };
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

  private getFeatureAppRetainer<
    TFeatureApp,
    TFeatureServices extends FeatureServices = FeatureServices,
    TConfig = unknown
  >(
    featureAppId: string,
    featureAppDefinition: FeatureAppDefinition<
      TFeatureApp,
      TFeatureServices,
      TConfig
    >,
    options: FeatureAppScopeOptions<TFeatureServices, TConfig>
  ): FeatureAppRetainer<TFeatureApp> {
    let featureAppRetainer = this.featureAppRetainers.get(featureAppId);

    if (featureAppRetainer) {
      featureAppRetainer.retain();
    } else {
      this.registerOwnFeatureServices(featureAppId, featureAppDefinition);

      featureAppRetainer = this.createFeatureAppRetainer(
        featureAppDefinition,
        featureAppId,
        options
      );
    }

    return featureAppRetainer as FeatureAppRetainer<TFeatureApp>;
  }

  private createFeatureAppRetainer<
    TFeatureApp,
    TFeatureServices extends FeatureServices,
    TConfig
  >(
    featureAppDefinition: FeatureAppDefinition<
      TFeatureApp,
      TFeatureServices,
      TConfig
    >,
    featureAppId: string,
    options: FeatureAppScopeOptions<TFeatureServices, TConfig>
  ): FeatureAppRetainer<TFeatureApp> {
    this.validateExternals(featureAppDefinition);

    const {baseUrl, beforeCreate, config} = options;

    const binding = this.featureServiceRegistry.bindFeatureServices(
      featureAppDefinition,
      featureAppId
    );

    const env: FeatureAppEnvironment<TFeatureServices, TConfig> = {
      baseUrl,
      config,
      featureAppId,
      featureServices: binding.featureServices as TFeatureServices
    };

    if (beforeCreate) {
      beforeCreate(env);
    }

    const featureApp = featureAppDefinition.create(env);

    this.logger.info(
      `The Feature App with the ID ${JSON.stringify(
        featureAppId
      )} has been successfully created.`
    );

    let retainCount = 1;

    const featureAppRetainer: FeatureAppRetainer<TFeatureApp> = {
      featureApp,

      retain: () => {
        retainCount += 1;
      },

      release: () => {
        retainCount -= 1;

        if (retainCount === 0) {
          this.featureAppRetainers.delete(featureAppId);
          binding.unbind();
        }
      }
    };

    this.featureAppRetainers.set(featureAppId, featureAppRetainer);

    return featureAppRetainer;
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
