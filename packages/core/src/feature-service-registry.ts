import {satisfies, valid} from 'semver';
import {ExternalsValidator, RequiredExternals} from './externals-validator';
import * as Messages from './internal/feature-service-registry-messages';
import {
  Dependencies,
  DependencyGraph,
  toposortDependencies
} from './internal/toposort-dependencies';
import {Logger} from './logger';

/**
 * A map of Feature Services with their ID as key and a semver-compatible
 * version string as value.
 */
export interface FeatureServiceConsumerDependencies {
  readonly [providerId: string]: string | undefined;
}

export interface FeatureServiceConsumerDefinition {
  readonly dependencies?: {
    /**
     * A map of required Feature Services with their ID as key and a
     * semver-compatible version string as value.
     */
    readonly featureServices?: FeatureServiceConsumerDependencies;
    readonly externals?: RequiredExternals;
  };
  readonly optionalDependencies?: {
    /**
     * A map of optional Feature Services with their ID as key and a
     * semver-compatible version string as value.
     */
    readonly featureServices?: FeatureServiceConsumerDependencies;
  };
}

export interface FeatureServices {
  [providerId: string]: unknown | undefined;
}

export interface FeatureServiceEnvironment<
  TFeatureServices extends FeatureServices
> {
  /**
   * An object of required Feature Services that are semver-compatible with the
   * declared dependencies in the Feature App definition.
   */
  readonly featureServices: TFeatureServices;
}

export interface FeatureServiceProviderDefinition<
  TSharedFeatureService extends SharedFeatureService,
  TFeatureServices extends FeatureServices = FeatureServices
> extends FeatureServiceConsumerDefinition {
  readonly id: string;

  create(
    env: FeatureServiceEnvironment<TFeatureServices>
  ): TSharedFeatureService;
}

export interface FeatureServiceBinding<TFeatureService> {
  readonly featureService: TFeatureService;

  unbind?(): void;
}

export type FeatureServiceBinder<TFeatureService> = (
  consumerId: string
) => FeatureServiceBinding<TFeatureService>;

export interface SharedFeatureService {
  readonly [version: string]: FeatureServiceBinder<unknown> | undefined;
}

export interface FeatureServicesBinding {
  readonly featureServices: FeatureServices;

  unbind(): void;
}

/**
 * @deprecated Use [[FeatureServiceRegistry]] instead.
 */
export type FeatureServiceRegistryLike = FeatureServiceRegistry;

export interface FeatureServiceRegistryOptions {
  /**
   * If the [[FeatureAppManager]] is configured with a
   * [[FeatureAppManagerOptions.moduleLoader]], to load Feature Apps from a
   * remote location that also provide their own Feature Services, i.e. the
   * Feature Services are included in a different bundle than the integrator
   * bundle, it might make sense to validate external dependencies that are
   * required by those Feature Services against the shared dependencies that are
   * provided by the integrator. This makes it possible that an error is already
   * thrown when registering a Feature Service with incompatible external
   * dependencies, and thus enables early feedback as to whether a Feature
   * Service is compatible with the integration environment.
   */
  readonly externalsValidator?: ExternalsValidator;

  /**
   * A custom logger that shall be used instead of `console`.
   */
  readonly logger?: Logger;
}

type ProviderId = string;

type ProviderDefinitionsById = Map<
  ProviderId,
  FeatureServiceProviderDefinition<SharedFeatureService>
>;

function mergeFeatureServiceDependencies({
  dependencies,
  optionalDependencies
}: FeatureServiceConsumerDefinition): Dependencies {
  return {
    ...(dependencies && dependencies.featureServices),
    ...(optionalDependencies && optionalDependencies.featureServices)
  };
}

function createDependencyGraph(
  definitions: FeatureServiceProviderDefinition<SharedFeatureService>[]
): DependencyGraph {
  const dependencyGraph: DependencyGraph = new Map();

  for (const definition of definitions) {
    dependencyGraph.set(
      definition.id,
      mergeFeatureServiceDependencies(definition)
    );
  }

  return dependencyGraph;
}

function isOptionalFeatureServiceDependency(
  {optionalDependencies}: FeatureServiceConsumerDefinition,
  providerId: ProviderId
): boolean {
  return Boolean(
    optionalDependencies &&
      optionalDependencies.featureServices &&
      optionalDependencies.featureServices.hasOwnProperty(providerId)
  );
}

function createProviderDefinitionsById(
  definitions: FeatureServiceProviderDefinition<SharedFeatureService>[]
): ProviderDefinitionsById {
  const providerDefinitionsById: ProviderDefinitionsById = new Map();

  for (const definition of definitions) {
    providerDefinitionsById.set(definition.id, definition);
  }

  return providerDefinitionsById;
}

/**
 * The FeatureServiceRegistry provides Feature Services to dependent consumers.
 * The integrator should instantiate a singleton instance of the registry.
 */
export class FeatureServiceRegistry {
  private readonly sharedFeatureServices = new Map<
    ProviderId,
    SharedFeatureService
  >();

  private readonly consumerIds = new Set<string>();

  private readonly logger: Logger;

  public constructor(
    private readonly options: FeatureServiceRegistryOptions = {}
  ) {
    this.logger = options.logger || console;
  }

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
   * Feature Service and its dependencies must either be registered together, or
   * the dependencies must have already been registered. It is not possible to
   * provide dependencies later. Sorting the provided definitions is not
   * necessary, since the registry takes care of registering the given
   * definitions in the correct order.
   * @param registrantId The ID of the entity that registers the provider
   * definitions.
   */
  public registerFeatureServices(
    providerDefinitions: FeatureServiceProviderDefinition<
      SharedFeatureService
    >[],
    registrantId: string
  ): void {
    const providerDefinitionsById = createProviderDefinitionsById(
      providerDefinitions
    );

    const dependencyGraph = createDependencyGraph(providerDefinitions);

    for (const providerId of toposortDependencies(dependencyGraph)) {
      this.registerFeatureService(
        providerDefinitionsById,
        providerId,
        registrantId
      );
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
   * @param consumerId The ID of the consumer to which dependencies should be
   * bound.
   */
  public bindFeatureServices(
    consumerDefinition: FeatureServiceConsumerDefinition,
    consumerId: string
  ): FeatureServicesBinding {
    if (this.consumerIds.has(consumerId)) {
      throw new Error(Messages.featureServicesAlreadyBound(consumerId));
    }

    const bindings = new Map<string, FeatureServiceBinding<unknown>>();
    const featureServices: FeatureServices = Object.create(null);
    const allDependencies = mergeFeatureServiceDependencies(consumerDefinition);

    for (const providerId of Object.keys(allDependencies)) {
      const optional = isOptionalFeatureServiceDependency(
        consumerDefinition,
        providerId
      );

      const versionRange = allDependencies[providerId];

      const binding = this.bindFeatureService(
        providerId,
        consumerId,
        versionRange,
        {optional}
      );

      if (!binding) {
        continue;
      }

      this.logger.info(
        Messages.featureServiceSuccessfullyBound(providerId, consumerId)
      );

      bindings.set(providerId, binding);

      featureServices[providerId] = binding.featureService;
    }

    this.consumerIds.add(consumerId);

    let unbound = false;

    const unbind = () => {
      if (unbound) {
        throw new Error(Messages.featureServicesAlreadyUnbound(consumerId));
      }

      unbound = true;

      this.consumerIds.delete(consumerId);

      for (const [providerId, binding] of bindings.entries()) {
        try {
          if (binding.unbind) {
            binding.unbind();
          }

          this.logger.info(
            Messages.featureServiceSuccessfullyUnbound(providerId, consumerId)
          );
        } catch (error) {
          this.logger.error(
            Messages.featureServiceCouldNotBeUnbound(providerId, consumerId),
            error
          );
        }
      }
    };

    return {featureServices, unbind};
  }

  private registerFeatureService(
    providerDefinitionsById: ProviderDefinitionsById,
    providerId: string,
    registrantId: string
  ): void {
    const providerDefinition = providerDefinitionsById.get(providerId);

    if (this.sharedFeatureServices.has(providerId)) {
      this.logger.warn(
        Messages.featureServiceAlreadyRegistered(providerId, registrantId)
      );
    } else if (providerDefinition) {
      this.validateExternals(providerDefinition);

      const {featureServices} = this.bindFeatureServices(
        providerDefinition,
        providerId
      );

      const sharedFeatureService = providerDefinition.create({featureServices});

      this.validateFeatureServiceVersions(
        sharedFeatureService,
        providerId,
        registrantId
      );

      this.sharedFeatureServices.set(providerId, sharedFeatureService);

      this.logger.info(
        Messages.featureServiceSuccessfullyRegistered(providerId, registrantId)
      );
    }
  }

  private bindFeatureService(
    providerId: string,
    consumerId: string,
    versionRange: string | undefined,
    {optional}: {optional: boolean}
  ): FeatureServiceBinding<unknown> | undefined {
    if (!versionRange) {
      const message = Messages.featureServiceDependencyVersionInvalid(
        optional,
        providerId,
        consumerId
      );

      if (optional) {
        this.logger.info(message);

        return;
      }

      throw new Error(message);
    }

    const sharedFeatureService = this.sharedFeatureServices.get(providerId);

    if (!sharedFeatureService) {
      const message = Messages.featureServiceNotRegistered(
        optional,
        providerId,
        consumerId
      );

      if (optional) {
        this.logger.info(message);

        return;
      }

      throw new Error(message);
    }

    const supportedVersions = Object.keys(sharedFeatureService);

    const version = supportedVersions.find(supportedVersion =>
      satisfies(supportedVersion, versionRange)
    );

    const bindFeatureService = version && sharedFeatureService[version];

    if (!bindFeatureService) {
      const message = Messages.featureServiceUnsupported(
        optional,
        providerId,
        consumerId,
        versionRange,
        supportedVersions
      );

      if (optional) {
        this.logger.info(message);

        return;
      }

      throw new Error(message);
    }

    return bindFeatureService(consumerId);
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

  private validateFeatureServiceVersions(
    sharedFeatureService: SharedFeatureService,
    providerId: string,
    registrantId: string
  ): void {
    for (const version of Object.keys(sharedFeatureService)) {
      if (!valid(version)) {
        throw new Error(
          Messages.featureServiceVersionInvalid(
            providerId,
            registrantId,
            version
          )
        );
      }
    }
  }
}
