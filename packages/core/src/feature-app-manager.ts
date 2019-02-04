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
  destroy(): void;
}

export interface FeatureAppManagerOptions {
  readonly configs?: FeatureAppConfigs;
  readonly moduleLoader?: ModuleLoader;
}

type FeatureAppModuleUrl = string;
type FeatureAppUid = string;

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

  public async preloadFeatureApp(url: string): Promise<void> {
    await this.getAsyncFeatureAppDefinition(url).promise;
  }

  public destroy(): void {
    for (const featureAppScope of this.featureAppScopes.values()) {
      featureAppScope.destroy();
    }
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

  private validateExternals({
    dependencies
  }: FeatureServiceConsumerDefinition): void {
    if (dependencies && dependencies.externals) {
      this.externalsValidator.validate(dependencies.externals);
    }
  }
}
