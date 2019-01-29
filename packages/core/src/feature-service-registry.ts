import {coerce, satisfies} from 'semver';
import {createUid} from './internal/create-uid';
import {toposortDependencies} from './internal/toposort-dependencies';

/**
 * A map of Feature Services with their ID as key and a semver-compatible
 * version string as value.
 */
export interface FeatureServiceConsumerDependencies {
  readonly [providerId: string]: string | undefined;
}

export interface FeatureServiceConsumerDefinition {
  readonly id: string;
  /**
   * A map of required Feature Services with their ID as key and a
   * semver-compatible version string as value.
   */
  readonly dependencies?: FeatureServiceConsumerDependencies;
  /**
   * A map of optional Feature Services with their ID as key and a
   * semver-compatible version string as value.
   */
  readonly optionalDependencies?: FeatureServiceConsumerDependencies;
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
  TSharedFeatureService extends SharedFeatureService,
  TFeatureServices extends FeatureServices = FeatureServices,
  TConfig = unknown
> extends FeatureServiceConsumerDefinition {
  create(
    env: FeatureServiceEnvironment<TConfig, TFeatureServices>
  ): TSharedFeatureService;
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
    providerDefinitions: FeatureServiceProviderDefinition<
      SharedFeatureService
    >[],
    consumerId: string
  ): void;

  bindFeatureServices(
    consumerDefinition: FeatureServiceConsumerDefinition,
    consumerIdSpecifier?: string
  ): FeatureServicesBinding;
}

export interface FeatureServiceRegistryOptions {
  /**
   * Configurations for all Feature Services that will potentially be
   * registered.
   */
  readonly configs?: FeatureServiceConfigs;
}

type ProviderId = string;

function unsupportedFeatureServiceMessage(
  optional: boolean,
  providerId: string,
  consumerUid: string,
  requiredVersion: string,
  supportedVersions: string[]
): string {
  return `The ${
    optional ? 'optional' : 'required'
  } Feature Service ${JSON.stringify(
    providerId
  )} in the unsupported version ${JSON.stringify(
    requiredVersion
  )} could not be bound to consumer ${JSON.stringify(
    consumerUid
  )}. The supported versions are ${JSON.stringify(supportedVersions)}.`;
}

function invalidFeatureServiceVersionMessage(
  providerId: string,
  consumerId: string
): string | undefined {
  return `The Feature Service ${JSON.stringify(
    providerId
  )} could not be registered by consumer ${JSON.stringify(
    consumerId
  )} because it contains an invalid version.`;
}

function invalidFeatureServiceDependencyVersionMessage(
  optional: boolean,
  providerId: string,
  consumerUid: string
): string {
  return `The ${
    optional ? 'optional' : 'required'
  } Feature Service ${JSON.stringify(
    providerId
  )} in an invalid version could not be bound to consumer ${JSON.stringify(
    consumerUid
  )}.`;
}

function unregisteredFeatureServiceMessage(
  optional: boolean,
  providerId: string,
  consumerUid: string
): string {
  return `The ${
    optional ? 'optional' : 'required'
  } Feature Service ${JSON.stringify(
    providerId
  )} is not registered and therefore could not be bound to consumer ${JSON.stringify(
    consumerUid
  )}.`;
}

function successfullyRegisteredFeatureServiceMessage(
  providerId: string,
  consumerId: string
): string {
  return `The Feature Service ${JSON.stringify(
    providerId
  )} has been successfully registered by consumer ${JSON.stringify(
    consumerId
  )}.`;
}

function alreadyRegisteredFeatureServiceMessage(
  providerId: string,
  consumerId: string
): string {
  return `The already registered Feature Service ${JSON.stringify(
    providerId
  )} could not be re-registered by consumer ${JSON.stringify(consumerId)}.`;
}

function successfullyBoundFeatureServiceMessage(
  providerId: string,
  consumerUid: string
): string {
  return `The required Feature Service ${JSON.stringify(
    providerId
  )} has been successfully bound to consumer ${JSON.stringify(consumerUid)}.`;
}

function featureServicesAlreadyBoundMessage(
  consumerUid: string
): string | undefined {
  return `All required Feature Services are already bound to consumer ${JSON.stringify(
    consumerUid
  )}.`;
}

function featureServiceUnbindingErrorMessage(
  providerId: string,
  consumerUid: string
): string {
  return `The required Feature Service ${JSON.stringify(
    providerId
  )} could not be unbound from consumer ${JSON.stringify(consumerUid)}.`;
}

function successfullyUnboundFeatureServiceMessage(
  providerId: string,
  consumerUid: string
): string {
  return `The required Feature Service ${JSON.stringify(
    providerId
  )} has been successfully unbound from consumer ${JSON.stringify(
    consumerUid
  )}.`;
}

function featureServicesAlreadyUnboundMessage(consumerUid: string): string {
  return `All required Feature Services are already unbound from consumer ${JSON.stringify(
    consumerUid
  )}.`;
}

/**
 * The FeatureServiceRegistry provides Feature Services to dependent consumers.
 * The integrator should instantiate a singleton instance of the registry.
 */
export class FeatureServiceRegistry implements FeatureServiceRegistryLike {
  private readonly sharedFeatureServices = new Map<
    ProviderId,
    SharedFeatureService
  >();

  private readonly consumerUids = new Set<string>();

  public constructor(
    private readonly options: FeatureServiceRegistryOptions = {}
  ) {}

  /**
   * Register a set of Feature Services to make them available for binding to
   * dependent consumers.
   *
   * @throws Throws an error if the dependencies of one of the provider
   * definitions can't be fulfilled.
   * @throws Throws an error if one of the registered Feature Services contains
   * an invalid version according to semver notation.
   *
   * @param providerDefinitions Feature Services that should be registered. A
   * Feature Service and its dependencies must either be registered together,
   * or the dependencies must have already been registered. It is not possible
   * to provide dependencies later. Sorting the provided definitions is not
   * necessary, since the registry takes care of registering the given
   * definitions in the correct order.
   * @param consumerId The ID of the consumer that provides the provider
   * definitions.
   */
  public registerFeatureServices(
    providerDefinitions: FeatureServiceProviderDefinition<
      SharedFeatureService
    >[],
    consumerId: string
  ): void {
    const providerDefinitionsById = new Map<
      string,
      FeatureServiceProviderDefinition<SharedFeatureService>
    >();

    for (const providerDefinition of providerDefinitions) {
      providerDefinitionsById.set(providerDefinition.id, providerDefinition);
    }

    for (const providerId of toposortDependencies(providerDefinitionsById)) {
      const providerDefinition = providerDefinitionsById.get(providerId);

      if (this.sharedFeatureServices.has(providerId)) {
        if (providerDefinitionsById.has(providerId)) {
          console.warn(
            alreadyRegisteredFeatureServiceMessage(providerId, consumerId)
          );
        }
      } else if (providerDefinition) {
        const {configs} = this.options;
        const config = configs && configs[providerId];
        const {featureServices} = this.bindFeatureServices(providerDefinition);

        const sharedFeatureService = providerDefinition.create({
          config,
          featureServices
        });

        for (const version of Object.keys(sharedFeatureService)) {
          if (!coerce(version)) {
            throw new Error(
              invalidFeatureServiceVersionMessage(providerId, consumerId)
            );
          }
        }

        this.sharedFeatureServices.set(providerId, sharedFeatureService);

        console.info(
          successfullyRegisteredFeatureServiceMessage(providerId, consumerId)
        );
      }
    }
  }

  /**
   * Bind all dependencies to a consumer.
   *
   * @throws Throws an error if non-optional dependencies can't be fulfilled.
   * @throws Throws an error if called with the same consumer definition and
   * specifier more than once.
   *
   * @param consumerDefinition The definition of the consumer to which
   * dependencies should be bound.
   * @param consumerIdSpecifier A specifier that distinguishes the consumer
   * from others with the same definition.
   */
  public bindFeatureServices(
    consumerDefinition: FeatureServiceConsumerDefinition,
    consumerIdSpecifier?: string
  ): FeatureServicesBinding {
    const {
      id: consumerId,
      dependencies = {},
      optionalDependencies = {}
    } = consumerDefinition;

    const consumerUid = createUid(consumerId, consumerIdSpecifier);

    if (this.consumerUids.has(consumerUid)) {
      throw new Error(featureServicesAlreadyBoundMessage(consumerUid));
    }

    const bindings = new Map<string, FeatureServiceBinding<unknown>>();
    const featureServices: FeatureServices = Object.create(null);
    const allDependencies = {...optionalDependencies, ...dependencies};

    for (const providerId of Object.keys(allDependencies)) {
      const binding = this.bindFeatureService(
        providerId,
        consumerUid,
        allDependencies[providerId],
        {optional: !dependencies.hasOwnProperty(providerId)}
      );

      if (!binding) {
        continue;
      }

      console.info(
        successfullyBoundFeatureServiceMessage(providerId, consumerUid)
      );

      bindings.set(providerId, binding);

      featureServices[providerId] = binding.featureService;
    }

    this.consumerUids.add(consumerUid);

    let unbound = false;

    const unbind = () => {
      if (unbound) {
        throw new Error(featureServicesAlreadyUnboundMessage(consumerUid));
      }

      unbound = true;

      this.consumerUids.delete(consumerUid);

      for (const [providerId, binding] of bindings.entries()) {
        try {
          if (binding.unbind) {
            binding.unbind();
          }

          console.info(
            successfullyUnboundFeatureServiceMessage(providerId, consumerUid)
          );
        } catch (error) {
          console.error(
            featureServiceUnbindingErrorMessage(providerId, consumerUid),
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
    requiredVersion: string | undefined,
    {optional}: {optional: boolean}
  ): FeatureServiceBinding<unknown> | undefined {
    if (!requiredVersion) {
      const message = invalidFeatureServiceDependencyVersionMessage(
        optional,
        providerId,
        consumerUid
      );

      if (optional) {
        console.info(message);

        return;
      }

      throw new Error(message);
    }

    const sharedFeatureService = this.sharedFeatureServices.get(providerId);

    if (!sharedFeatureService) {
      const message = unregisteredFeatureServiceMessage(
        optional,
        providerId,
        consumerUid
      );

      if (optional) {
        console.info(message);

        return;
      }

      throw new Error(message);
    }

    const supportedVersions = Object.keys(sharedFeatureService);

    const version = supportedVersions.find(supportedVersion => {
      const actualVersion = coerce(supportedVersion);

      // We already ensure coercebility at service registration time.
      // tslint:disable-next-line: no-non-null-assertion
      return satisfies(actualVersion!, requiredVersion);
    });

    const bindFeatureService = version && sharedFeatureService[version];

    if (!bindFeatureService) {
      const message = unsupportedFeatureServiceMessage(
        optional,
        providerId,
        consumerUid,
        requiredVersion,
        supportedVersions
      );

      if (optional) {
        console.info(message);

        return;
      }

      throw new Error(message);
    }

    return bindFeatureService(consumerUid);
  }
}
