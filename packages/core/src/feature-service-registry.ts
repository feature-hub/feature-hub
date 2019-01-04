import {coerce, satisfies} from 'semver';
import {createUid} from './internal/create-uid';
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
  TFeatureServices extends FeatureServices
> {
  /**
   * A Feature Service config object that is provided by the integrator.
   */
  readonly config: TConfig;

  /**
   * An object of required Feature Services that are semver-compatible with the
   * declared dependencies in the Feature App definition.
   */
  readonly featureServices: TFeatureServices;
}

export interface FeatureServiceProviderDefinition<
  TConfig = unknown,
  TFeatureServices extends FeatureServices = FeatureServices
> extends FeatureServiceConsumerDefinition {
  create(
    env: FeatureServiceEnvironment<TConfig, TFeatureServices>
  ): SharedFeatureService;
}

export interface FeatureServiceBinding<TFeatureService> {
  readonly featureService: TFeatureService;

  unbind?(): void;
}

export type FeatureServiceBinder<TFeatureService> = (
  consumerUid: string
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
  registerFeatureServices(
    providerDefinitions: FeatureServiceProviderDefinition[],
    consumerId: string
  ): void;

  bindFeatureServices(
    consumerDefinition: FeatureServiceConsumerDefinition,
    consumerIdSpecifier?: string
  ): FeatureServicesBinding;
}

export interface FeatureServiceRegistryOptions {
  readonly configs?: FeatureServiceConfigs;
}

type ProviderId = string;

function createUnsupportedFeatureServiceError(
  providerId: string,
  consumerUid: string,
  requiredVersion: string,
  supportedVersions: string[]
): Error {
  return new Error(
    `The required Feature Service ${JSON.stringify(
      providerId
    )} in the unsupported version ${JSON.stringify(
      requiredVersion
    )} could not be bound to consumer ${JSON.stringify(
      consumerUid
    )}. The supported versions are ${JSON.stringify(supportedVersions)}.`
  );
}

export class FeatureServiceRegistry implements FeatureServiceRegistryLike {
  private readonly sharedFeatureServices = new Map<
    ProviderId,
    SharedFeatureService
  >();

  private readonly consumerUids = new Set<string>();

  public constructor(
    private readonly options: FeatureServiceRegistryOptions = {}
  ) {}

  public registerFeatureServices(
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
            `The already registered Feature Service ${JSON.stringify(
              providerId
            )} could not be re-registered by consumer ${JSON.stringify(
              consumerId
            )}.`
          );
        }
      } else if (providerDefinition) {
        const {configs} = this.options;
        const config = configs && configs[providerId];
        const {featureServices} = this.bindFeatureServices(providerDefinition);

        this.sharedFeatureServices.set(
          providerId,
          providerDefinition.create({config, featureServices})
        );

        console.info(
          `The Feature Service ${JSON.stringify(
            providerId
          )} has been successfully registered by consumer ${JSON.stringify(
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

    const consumerUid = createUid(consumerId, consumerIdSpecifier);

    if (this.consumerUids.has(consumerUid)) {
      throw new Error(
        `All required Feature Services are already bound to consumer ${JSON.stringify(
          consumerUid
        )}.`
      );
    }

    const bindings = new Map<string, FeatureServiceBinding<unknown>>();
    const featureServices: FeatureServices = Object.create(null);

    if (consumerDependencies) {
      for (const providerId of Object.keys(consumerDependencies)) {
        const binding = this.bindFeatureService(
          providerId,
          consumerUid,
          consumerDependencies[providerId]
        );

        console.info(
          `The required Feature Service ${JSON.stringify(
            providerId
          )} has been successfully bound to consumer ${JSON.stringify(
            consumerUid
          )}.`
        );

        bindings.set(providerId, binding);

        featureServices[providerId] = binding.featureService;
      }
    }

    this.consumerUids.add(consumerUid);

    let unbound = false;

    const unbind = () => {
      if (unbound) {
        throw new Error(
          `All required Feature Services are already unbound from consumer ${JSON.stringify(
            consumerUid
          )}.`
        );
      }

      unbound = true;

      this.consumerUids.delete(consumerUid);

      for (const [providerId, binding] of bindings.entries()) {
        try {
          if (binding.unbind) {
            binding.unbind();
          }

          console.info(
            `The required Feature Service ${JSON.stringify(
              providerId
            )} has been successfully unbound from consumer ${JSON.stringify(
              consumerUid
            )}.`
          );
        } catch (error) {
          console.error(
            `The required Feature Service ${JSON.stringify(
              providerId
            )} could not be unbound from consumer ${JSON.stringify(
              consumerUid
            )}.`,
            error
          );
        }
      }
    };

    return {featureServices, unbind};
  }

  private bindFeatureService(
    providerId: string,
    consumerUid: string,
    requiredVersion: string | undefined
  ): FeatureServiceBinding<unknown> {
    if (!requiredVersion) {
      throw new Error(
        `The required Feature Service ${JSON.stringify(
          providerId
        )} in an invalid version could not be bound to consumer ${JSON.stringify(
          consumerUid
        )}.`
      );
    }

    const sharedFeatureService = this.sharedFeatureServices.get(providerId);

    if (!sharedFeatureService) {
      throw new Error(
        `The required Feature Service ${JSON.stringify(
          providerId
        )} is not registered and therefore could not be bound to consumer ${JSON.stringify(
          consumerUid
        )}.`
      );
    }

    const supportedVersions = Object.keys(sharedFeatureService);

    const version = supportedVersions.find(supportedVersion => {
      const actualVersion = coerce(supportedVersion);

      if (!actualVersion) {
        throw createUnsupportedFeatureServiceError(
          providerId,
          consumerUid,
          requiredVersion,
          supportedVersions
        );
      }

      return satisfies(actualVersion, requiredVersion);
    });

    const bindFeatureService = version && sharedFeatureService[version];

    if (!bindFeatureService) {
      throw createUnsupportedFeatureServiceError(
        providerId,
        consumerUid,
        requiredVersion,
        supportedVersions
      );
    }

    return bindFeatureService(consumerUid);
  }
}
