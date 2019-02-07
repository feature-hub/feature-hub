import {satisfies, valid} from 'semver';
import {ExternalsValidatorLike, RequiredExternals} from './externals-validator';
import {createUid} from './internal/create-uid';
import * as Messages from './internal/feature-service-registry-messages';
import {
  Dependencies,
  DependencyGraph,
  toposortDependencies
} from './internal/toposort-dependencies';

/**
 * A map of Feature Services with their ID as key and a semver-compatible
 * version string as value.
 */
export interface FeatureServiceConsumerDependencies {
  readonly [providerId: string]: string | undefined;
}

export interface FeatureServiceConsumerDefinition {
  readonly id: string;
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

  /**
   * When the {@link FeatureAppManager} is configured with a
   * {@link FeatureAppManager#moduleLoader}, to load Feature Apps from a remote
   * location that also provide their own Feature Services, i.e. the Feature
   * Services are included in a different bundle than the integrator bundle, it
   * might make sense to validate external dependencies that are required by
   * those Feature Services against the shared dependencies that are provided by
   * the integrator. This makes it possible that an error is already thrown when
   * registering a Feature Service with incompatible external dependencies, and
   * thus enables early feedback as to whether a Feature Service is compatible
   * with the integration environment.
   */
  readonly externalsValidator?: ExternalsValidatorLike;
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

function unbindBinding(
  binding: FeatureServiceBinding<unknown>,
  providerId: string,
  consumerUid: string
): void {
  try {
    if (binding.unbind) {
      binding.unbind();
    }

    console.info(
      Messages.featureServiceSuccessfullyUnbound(providerId, consumerUid)
    );
  } catch (error) {
    console.error(
      Messages.featureServiceCouldNotBeUnbound(providerId, consumerUid),
      error
    );
  }
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
    const providerDefinitionsById = createProviderDefinitionsById(
      providerDefinitions
    );

    const dependencyGraph = createDependencyGraph(providerDefinitions);

    for (const providerId of toposortDependencies(dependencyGraph)) {
      this.registerFeatureService(
        providerDefinitionsById,
        providerId,
        consumerId
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
   * @param consumerIdSpecifier A specifier that distinguishes the consumer
   * from others with the same definition.
   */
  public bindFeatureServices(
    consumerDefinition: FeatureServiceConsumerDefinition,
    consumerIdSpecifier?: string
  ): FeatureServicesBinding {
    const {id: consumerId} = consumerDefinition;

    const consumerUid = createUid(consumerId, consumerIdSpecifier);

    if (this.consumerUids.has(consumerUid)) {
      throw new Error(Messages.featureServicesAlreadyBound(consumerUid));
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
        consumerUid,
        versionRange,
        {optional}
      );

      if (!binding) {
        continue;
      }

      console.info(
        Messages.featureServiceSuccessfullyBound(providerId, consumerUid)
      );

      bindings.set(providerId, binding);

      featureServices[providerId] = binding.featureService;
    }

    this.consumerUids.add(consumerUid);

    let unbound = false;

    const unbind = () => {
      if (unbound) {
        throw new Error(Messages.featureServicesAlreadyUnbound(consumerUid));
      }

      unbound = true;

      this.consumerUids.delete(consumerUid);

      for (const [providerId, binding] of bindings.entries()) {
        unbindBinding(binding, providerId, consumerUid);
      }
    };

    return {featureServices, unbind};
  }

  private registerFeatureService(
    providerDefinitionsById: ProviderDefinitionsById,
    providerId: string,
    consumerId: string
  ): void {
    const providerDefinition = providerDefinitionsById.get(providerId);

    if (this.sharedFeatureServices.has(providerId)) {
      if (providerDefinitionsById.has(providerId)) {
        console.warn(
          Messages.featureServiceAlreadyRegistered(providerId, consumerId)
        );
      }
    } else if (providerDefinition) {
      this.validateExternals(providerDefinition);

      const {configs} = this.options;
      const config = configs && configs[providerId];
      const {featureServices} = this.bindFeatureServices(providerDefinition);

      const sharedFeatureService = providerDefinition.create({
        config,
        featureServices
      });

      this.validateFeatureServiceVersions(
        sharedFeatureService,
        providerId,
        consumerId
      );

      this.sharedFeatureServices.set(providerId, sharedFeatureService);

      console.info(
        Messages.featureServiceSuccessfullyRegistered(providerId, consumerId)
      );
    }
  }

  private bindFeatureService(
    providerId: string,
    consumerUid: string,
    versionRange: string | undefined,
    {optional}: {optional: boolean}
  ): FeatureServiceBinding<unknown> | undefined {
    if (!versionRange) {
      const message = Messages.featureServiceDependencyVersionInvalid(
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
      const message = Messages.featureServiceNotRegistered(
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

    const version = supportedVersions.find(supportedVersion =>
      satisfies(supportedVersion, versionRange)
    );

    const bindFeatureService = version && sharedFeatureService[version];

    if (!bindFeatureService) {
      const message = Messages.featureServiceUnsupported(
        optional,
        providerId,
        consumerUid,
        versionRange,
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
    consumerId: string
  ): void {
    for (const version of Object.keys(sharedFeatureService)) {
      if (!valid(version)) {
        throw new Error(
          Messages.featureServiceVersionInvalid(providerId, consumerId, version)
        );
      }
    }
  }
}
