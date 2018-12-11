import {AsyncValue} from './async-value';
import {
  FeatureServiceConsumerDefinition,
  FeatureServiceProviderDefinition,
  FeatureServiceRegistryLike,
  FeatureServices
} from './feature-service-registry';
import {isFeatureAppModule} from './internal/is-feature-app-module';

export interface FeatureAppEnvironment<
  TConfig,
  TFeatureServices extends FeatureServices
> {
  /**
   * A consumer config object that is provided by the integrator.
   */
  readonly config: TConfig;

  /**
   * An object of required Feature Services that are semver-compatible with the
   * declared dependencies in the Feature App definition.
   */
  readonly featureServices: TFeatureServices;
}

export interface FeatureAppDefinition<
  TFeatureApp,
  TConfig = unknown,
  TFeatureServices extends FeatureServices = FeatureServices
> extends FeatureServiceConsumerDefinition {
  readonly ownFeatureServiceDefinitions?: FeatureServiceProviderDefinition[];

  create(env: FeatureAppEnvironment<TConfig, TFeatureServices>): TFeatureApp;
}

export type ModuleLoader = (url: string) => Promise<unknown>;

export interface FeatureAppScope {
  readonly featureApp: unknown;

  destroy(): void;
}

export interface FeatureAppConfigs {
  readonly [featureAppId: string]: unknown;
}

export interface FeatureAppManagerLike {
  getAsyncFeatureAppDefinition(
    url: string
  ): AsyncValue<FeatureAppDefinition<unknown>>;

  getFeatureAppScope(
    featureAppDefinition: FeatureAppDefinition<unknown>,
    idSpecifier?: string
  ): FeatureAppScope;

  preloadFeatureApp(url: string): Promise<void>;
  destroy(): void;
}

type FeatureAppModuleUrl = string;
type FeatureAppScopeId = string;

export class FeatureAppManager implements FeatureAppManagerLike {
  private readonly asyncFeatureAppDefinitions = new Map<
    FeatureAppModuleUrl,
    AsyncValue<FeatureAppDefinition<unknown>>
  >();

  private readonly featureAppDefinitionsWithRegisteredOwnFeatureServices = new WeakSet<
    FeatureAppDefinition<unknown>
  >();

  private readonly featureAppScopes = new Map<
    FeatureAppScopeId,
    FeatureAppScope
  >();

  public constructor(
    private readonly featureServiceRegistry: FeatureServiceRegistryLike,
    private readonly loadModule: ModuleLoader,
    private readonly configs: FeatureAppConfigs = Object.create(null)
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

  public getFeatureAppScope(
    featureAppDefinition: FeatureAppDefinition<unknown>,
    idSpecifier?: string
  ): FeatureAppScope {
    const {id: featureAppId} = featureAppDefinition;
    const featureAppScopeId = JSON.stringify({featureAppId, idSpecifier});

    let featureAppScope = this.featureAppScopes.get(featureAppScopeId);

    if (!featureAppScope) {
      this.registerOwnFeatureServices(featureAppDefinition);

      const deleteFeatureAppScope = () =>
        this.featureAppScopes.delete(featureAppScopeId);

      featureAppScope = this.createFeatureAppScope(
        featureAppDefinition,
        idSpecifier,
        deleteFeatureAppScope
      );

      this.featureAppScopes.set(featureAppScopeId, featureAppScope);
    }

    return featureAppScope;
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
    return new AsyncValue(
      this.loadModule(url).then(featureAppModule => {
        if (!isFeatureAppModule(featureAppModule)) {
          throw new Error(
            `The feature app module at url ${JSON.stringify(
              url
            )} is invalid. A feature app module must have a feature app definition as default export. A feature app definition is an object with at least an \`id\` string and a \`create\` method.`
          );
        }

        console.info(
          `The feature app module for the url ${JSON.stringify(
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
      this.featureServiceRegistry.registerProviders(
        featureAppDefinition.ownFeatureServiceDefinitions,
        featureAppDefinition.id
      );
    }

    this.featureAppDefinitionsWithRegisteredOwnFeatureServices.add(
      featureAppDefinition
    );
  }

  private createFeatureAppScope(
    featureAppDefinition: FeatureAppDefinition<unknown>,
    idSpecifier: string | undefined,
    deleteFeatureAppScope: () => void
  ): FeatureAppScope {
    const config = this.configs[featureAppDefinition.id];

    const binding = this.featureServiceRegistry.bindFeatureServices(
      featureAppDefinition,
      idSpecifier
    );

    const featureApp = featureAppDefinition.create({
      config,
      featureServices: binding.featureServices
    });

    console.info(
      `The feature app scope for the ID ${JSON.stringify(
        featureAppDefinition.id
      )} and its specifier ${JSON.stringify(
        idSpecifier
      )} has been successfully created.`
    );

    let destroyed = false;

    const destroy = () => {
      if (destroyed) {
        throw new Error(
          `The feature app scope for the ID ${JSON.stringify(
            featureAppDefinition.id
          )} and its specifier ${JSON.stringify(
            idSpecifier
          )} could not be destroyed.`
        );
      }

      deleteFeatureAppScope();
      binding.unbind();

      destroyed = true;
    };

    return {featureApp, destroy};
  }
}
