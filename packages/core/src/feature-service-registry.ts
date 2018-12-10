import {coerce, satisfies} from 'semver';
import {toposortDependencies} from './internal/toposort-dependencies';

export interface FeatureServiceConsumerDependencies {
  readonly [providerId: string]: string | undefined;
}

export interface FeatureServiceConsumerDefinition {
  readonly id: string;
  readonly dependencies?: FeatureServiceConsumerDependencies;
}

export interface FeatureServices {
  [providerId: string]: unknown | undefined;
}

export interface FeatureServiceEnvironment<
  TConfig,
  TRequiredFeatureServices extends FeatureServices
> {
  readonly config: TConfig;
  readonly requiredFeatureServices: TRequiredFeatureServices;
}

export interface FeatureServiceProviderDefinition<
  TConfig = unknown,
  TRequiredFeatureServices extends FeatureServices = FeatureServices
> extends FeatureServiceConsumerDefinition {
  create(
    env: FeatureServiceEnvironment<TConfig, TRequiredFeatureServices>
  ): SharedFeatureService;
}

export interface FeatureServiceBinding<TFeatureService> {
  readonly featureService: TFeatureService;

  unbind?(): void;
}

export type FeatureServiceBinder<TFeatureService> = (
  uniqueConsumerId: string
) => FeatureServiceBinding<TFeatureService>;

export interface SharedFeatureService {
  readonly [version: string]: FeatureServiceBinder<unknown> | undefined;
}

export interface FeatureServicesBinding {
  readonly featureServices: FeatureServices;

  unbind(): void;
}

export interface FeatureServiceConfigs {
  readonly [featureServiceId: string]: unknown;
}

export interface FeatureServiceRegistryLike {
  registerProviders(
    providerDefinitions: FeatureServiceProviderDefinition[],
    consumerId: string
  ): void;

  bindFeatureServices(
    consumerDefinition: FeatureServiceConsumerDefinition,
    consumerIdSpecifier?: string
  ): FeatureServicesBinding;
}

type ProviderId = string;

export class FeatureServiceRegistry implements FeatureServiceRegistryLike {
  private readonly sharedFeatureServices = new Map<
    ProviderId,
    SharedFeatureService
  >();

  private readonly uniqueConsumerIds = new Set<string>();

  public constructor(
    private readonly configs: FeatureServiceConfigs = Object.create(null)
  ) {}

  public registerProviders(
    providerDefinitions: FeatureServiceProviderDefinition[],
    consumerId: string
  ): void {
    const dependencyGraph = new Map<string, FeatureServiceProviderDefinition>();

    for (const providerDefinition of providerDefinitions) {
      dependencyGraph.set(providerDefinition.id, providerDefinition);
    }

    for (const providerId of toposortDependencies(dependencyGraph)) {
      const providerDefinition = dependencyGraph.get(providerId);

      if (this.sharedFeatureServices.has(providerId)) {
        if (dependencyGraph.has(providerId)) {
          console.warn(
            `The already registered feature service provider ${JSON.stringify(
              providerId
            )} could not be re-registered by the consumer ${JSON.stringify(
              consumerId
            )}.`
          );
        }
      } else if (providerDefinition) {
        const config = this.configs[providerId];
        const {featureServices} = this.bindFeatureServices(providerDefinition);

        this.sharedFeatureServices.set(
          providerId,
          providerDefinition.create({
            config,
            requiredFeatureServices: featureServices
          })
        );

        console.info(
          `The feature service provider ${JSON.stringify(
            providerId
          )} has been successfully registered by the consumer ${JSON.stringify(
            consumerId
          )}.`
        );
      }
    }
  }

  public bindFeatureServices(
    consumerDefinition: FeatureServiceConsumerDefinition,
    consumerIdSpecifier?: string
  ): FeatureServicesBinding {
    const {
      id: consumerId,
      dependencies: consumerDependencies
    } = consumerDefinition;

    const uniqueConsumerId = consumerIdSpecifier
      ? `${consumerId}:${consumerIdSpecifier}`
      : consumerId;

    if (this.uniqueConsumerIds.has(uniqueConsumerId)) {
      throw new Error(
        `All required feature services are already bound to the consumer ${JSON.stringify(
          uniqueConsumerId
        )}.`
      );
    }

    const bindings = new Map<string, FeatureServiceBinding<unknown>>();
    const featureServices: FeatureServices = Object.create(null);

    if (consumerDependencies) {
      for (const providerId of Object.keys(consumerDependencies)) {
        const binding = this.bindFeatureService(
          providerId,
          uniqueConsumerId,
          consumerDependencies[providerId]
        );

        bindings.set(providerId, binding);

        featureServices[providerId] = binding.featureService;
      }
    }

    this.uniqueConsumerIds.add(uniqueConsumerId);

    let unbound = false;

    const unbind = () => {
      if (unbound) {
        throw new Error(
          `All required feature services are already unbound from the consumer ${JSON.stringify(
            uniqueConsumerId
          )}.`
        );
      }

      unbound = true;

      this.uniqueConsumerIds.delete(uniqueConsumerId);

      for (const [providerId, binding] of bindings.entries()) {
        try {
          if (binding.unbind) {
            binding.unbind();
          }

          console.info(
            `The required feature service of the provider ${JSON.stringify(
              providerId
            )} has been successfully unbound from the consumer ${JSON.stringify(
              uniqueConsumerId
            )}.`
          );
        } catch (error) {
          console.error(
            `The required feature service of the provider ${JSON.stringify(
              providerId
            )} could not be unbound from the consumer ${JSON.stringify(
              uniqueConsumerId
            )}.`,
            error
          );
        }
      }
    };

    console.info(
      `All required feature services have been successfully bound to the consumer ${JSON.stringify(
        uniqueConsumerId
      )}.`
    );

    return {featureServices, unbind};
  }

  private bindFeatureService(
    providerId: string,
    uniqueConsumerId: string,
    requiredVersion: string | undefined
  ): FeatureServiceBinding<unknown> {
    if (!requiredVersion) {
      throw new Error(
        `The required unknown feature service of the provider ${JSON.stringify(
          providerId
        )} could not be bound to the consumer ${JSON.stringify(
          uniqueConsumerId
        )}.`
      );
    }

    const sharedFeatureService = this.sharedFeatureServices.get(providerId);

    if (!sharedFeatureService) {
      throw new Error(
        `The required feature service in version ${JSON.stringify(
          requiredVersion
        )} of the unregistered provider ${JSON.stringify(
          providerId
        )} could not be bound to the consumer ${JSON.stringify(
          uniqueConsumerId
        )}.`
      );
    }

    const supportedVersions = Object.keys(sharedFeatureService);

    const version = supportedVersions.find(supportedVersion => {
      const actualVersion = coerce(supportedVersion);

      if (!actualVersion) {
        throw new Error(
          `The required feature service in version ${JSON.stringify(
            requiredVersion
          )} of the provider ${JSON.stringify(
            providerId
          )} could not be bound to the consumer ${JSON.stringify(
            uniqueConsumerId
          )} due to an invalid provider version ${JSON.stringify(
            supportedVersion
          )}.`
        );
      }

      return satisfies(actualVersion, requiredVersion);
    });

    const bindFeatureService = version && sharedFeatureService[version];

    if (!bindFeatureService) {
      throw new Error(
        `The required feature service in the unsupported version ${JSON.stringify(
          requiredVersion
        )} of the provider ${JSON.stringify(
          providerId
        )} could not be bound to the consumer ${JSON.stringify(
          uniqueConsumerId
        )}. The supported versions are ${JSON.stringify(supportedVersions)}.`
      );
    }

    return bindFeatureService(uniqueConsumerId);
  }
}
