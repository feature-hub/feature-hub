import {AsyncValue} from './async-value';
import {ExternalsValidator} from './externals-validator';
import {
  FeatureServiceConsumerDefinition,
  FeatureServiceProviderDefinition,
  FeatureServiceRegistry,
  FeatureServices,
  SharedFeatureService,
} from './feature-service-registry';
import * as Messages from './internal/feature-app-manager-messages';
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
   * The name that the integrator might have assigned to the Feature App.
   */
  readonly featureAppName: string | undefined;

  /**
   * The absolute or relative base URL of the Feature App's assets and/or BFF.
   */
  readonly baseUrl: string | undefined;

  /**
   * If this callback is defined, a short-lived Feature App can call this
   * function when it has completed its task. The Integrator (or parent Feature
   * App) can then decide to e.g. unmount the Feature App.
   *
   * Optionally, the Feature App can pass a result into the done callback. The
   * type/structure of the result must be agreed between the Integrator (or
   * parent Feature App) and the Feature App.
   */
  readonly done?: (result?: unknown) => void;
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

/**
 * @param url A URL pointing to a [[FeatureAppDefinition]] bundle in a module
 * format compatible with the module loader.
 *
 * @param moduleType The module type of the [[FeatureAppDefinition]] bundle.
 * This can be used to choose different loading strategies based on the module
 * type of the Feature App.
 */
export type ModuleLoader = (
  url: string,
  moduleType?: string
) => Promise<unknown>;

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
   * The Feature App's name. In contrast to the `featureAppId`, the name must
   * not be unique. It can be used by required Feature Services for display
   * purposes, logging, looking up Feature App configuration meta data, etc.
   */
  readonly featureAppName?: string;

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

  /**
   * A callback that is passed to the Feature App's `create` method. A
   * short-lived Feature App can call this function when it has completed its
   * task. The Integrator (or parent Feature App) can then decide to e.g.
   * unmount the Feature App.
   *
   * Optionally, the Feature App can pass a result into the done callback. The
   * type/structure of the result must be agreed between the Integrator (or
   * parent Feature App) and the Feature App.
   */
  readonly done?: (result?: unknown) => void;
}

export interface OnBindParams {
  readonly featureAppDefinition: FeatureServiceConsumerDefinition;
  readonly featureAppId: string;
  readonly featureAppName: string | undefined;
}

export interface FeatureAppManagerOptions {
  /**
   * For the `FeatureAppManager` to be able to load Feature Apps from a remote
   * location, a module loader must be provided. This can either be one of the
   * module loaders that are provided by @feature-hub, i.e.
   * `@feature-hub/module-loader-amd`, `@feature-hub/module-loader-federation`,
   * and `@feature-hub/module-loader-commonjs`, or a custom loader.
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

  /**
   * A function that is called for every Feature App when its dependent Feature
   * Services are bound. This allows the integrator to collect information about
   * Feature Service usage.
   */
  readonly onBind?: (params: OnBindParams) => void;
}

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
    string,
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
   * @param url A URL pointing to a [[FeatureAppDefinition]] bundle in a module
   * format compatible with the module loader.
   *
   * @param moduleType The module type of the [[FeatureAppDefinition]] bundle.
   * This value can be used by the provided
   * [[FeatureAppManagerOptions.moduleLoader]].
   *
   * @returns An [[AsyncValue]] containing a promise that resolves with the
   * loaded [[FeatureAppDefinition]]. If called again with the same URL it
   * returns the same [[AsyncValue]]. The promise rejects when loading fails, or
   * when the loaded bundle doesn't export a [[FeatureAppDefinition]] as
   * default.
   */
  public getAsyncFeatureAppDefinition(
    url: string,
    moduleType?: string
  ): AsyncValue<FeatureAppDefinition<unknown>> {
    const key = `${url}${moduleType}`;
    let asyncFeatureAppDefinition = this.asyncFeatureAppDefinitions.get(key);

    if (!asyncFeatureAppDefinition) {
      asyncFeatureAppDefinition = this.createAsyncFeatureAppDefinition(
        url,
        moduleType
      );

      this.asyncFeatureAppDefinitions.set(key, asyncFeatureAppDefinition);
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
      },
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
   * @param url A URL pointing to a [[FeatureAppDefinition]] bundle in a module
   * format compatible with the module loader.
   *
   * @param moduleType The module type of the [[FeatureAppDefinition]] bundle.
   * This value can be used by the provided
   * [[FeatureAppManagerOptions.moduleLoader]].
   */
  public async preloadFeatureApp(
    url: string,
    moduleType?: string
  ): Promise<void> {
    await this.getAsyncFeatureAppDefinition(url, moduleType).promise;
  }

  private createAsyncFeatureAppDefinition(
    url: string,
    moduleType?: string
  ): AsyncValue<FeatureAppDefinition<unknown>> {
    const {moduleLoader: loadModule} = this.options;

    if (!loadModule) {
      throw new Error('No module loader provided.');
    }

    return new AsyncValue(
      loadModule(url, moduleType).then((featureAppModule) => {
        if (!isFeatureAppModule(featureAppModule)) {
          throw new Error(
            Messages.invalidFeatureAppModule(
              url,
              moduleType,
              this.options.moduleLoader
            )
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

    const {featureAppName, baseUrl, beforeCreate, config, done} = options;

    const binding = this.featureServiceRegistry.bindFeatureServices(
      featureAppDefinition,
      featureAppId,
      featureAppName
    );

    try {
      this.options.onBind?.({
        featureAppDefinition,
        featureAppId,
        featureAppName,
      });
    } catch (error) {
      this.logger.error('Failed to execute onBind callback.', error);
    }

    const env: FeatureAppEnvironment<TFeatureServices, TConfig> = {
      baseUrl,
      config,
      featureAppId,
      featureAppName,
      featureServices: binding.featureServices as TFeatureServices,
      done,
    };

    try {
      beforeCreate?.(env);

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
        },
      };

      this.featureAppRetainers.set(featureAppId, featureAppRetainer);

      return featureAppRetainer;
    } catch (error) {
      binding.unbind();

      throw error;
    }
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
