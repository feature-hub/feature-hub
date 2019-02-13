import {
  ExternalsValidator,
  ExternalsValidatorLike,
  ProvidedExternals
} from './externals-validator';
import {
  FeatureAppConfigs,
  FeatureAppManager,
  FeatureAppManagerLike,
  ModuleLoader
} from './feature-app-manager';
import {
  FeatureServiceConfigs,
  FeatureServiceConsumerDefinition,
  FeatureServiceConsumerDependencies,
  FeatureServiceProviderDefinition,
  FeatureServiceRegistry,
  FeatureServiceRegistryLike,
  FeatureServices,
  SharedFeatureService
} from './feature-service-registry';

export interface FeatureHub {
  /**
   * The {@link FeatureAppManager} singleton instance.
   */
  readonly featureAppManager: FeatureAppManagerLike;

  /**
   * The {@link FeatureServiceRegistry} singleton instance.
   */
  readonly featureServiceRegistry: FeatureServiceRegistryLike;

  /**
   * The Feature Services that are bound to the integrator based on the {@link
   * FeatureHubOptions.featureServiceDependencies}.
   */
  readonly featureServices: FeatureServices;
}

export interface FeatureHubOptions {
  /**
   * Configurations for all Feature Apps that will potentially be created.
   */
  readonly featureAppConfigs?: FeatureAppConfigs;

  /**
   * Configurations for all Feature Services that will potentially be
   * registered.
   */
  readonly featureServiceConfigs?: FeatureServiceConfigs;

  /**
   * Provided Feature Services. Sorting the provided definitions is not
   * necessary, since the registry takes care of registering the given
   * definitions in the correct order.
   */
  readonly featureServiceDefinitions?: FeatureServiceProviderDefinition<
    SharedFeatureService
  >[];

  /**
   * A map of Feature Services the integrator depends on, with the Feature
   * Service ID as key and a semver-compatible version string as value.
   */
  readonly featureServiceDependencies?: FeatureServiceConsumerDependencies;

  /**
   * A map of provided externals, with their names as keys and strict semver
   * versions as values.
   */
  readonly providedExternals?: ProvidedExternals;

  /**
   * For the {@link FeatureAppManager} to be able to load Feature Apps from a
   * remote location, a module loader must be provided, (e.g. the
   * `@feature-hub/module-loader-amd` package or the
   * `@feature-hub/module-loader-commonjs` package).
   */
  readonly moduleLoader?: ModuleLoader;
}

/**
 * Creates the {@link FeatureServiceRegistry} singleton instance, registers all
 * {@link FeatureHubOptions.featureServiceDefinitions} for the given integrator
 * ID, and instantiates a {@link FeatureAppManager} singleton instance using
 * the {@link FeatureServiceRegistry}.
 *
 * @param integratorId A self-selected but unique consumer ID that is used to
 * register or consume Feature Services.
 */
export function createFeatureHub(
  integratorId: string,
  options: FeatureHubOptions = {}
): FeatureHub {
  const {
    featureAppConfigs,
    featureServiceConfigs,
    featureServiceDefinitions,
    featureServiceDependencies,
    providedExternals,
    moduleLoader
  } = options;

  let externalsValidator: ExternalsValidatorLike | undefined;

  if (providedExternals) {
    externalsValidator = new ExternalsValidator(providedExternals);
  }

  const featureServiceRegistry = new FeatureServiceRegistry({
    configs: featureServiceConfigs,
    externalsValidator
  });

  const integratorDefinition: FeatureServiceConsumerDefinition = {
    id: integratorId,
    dependencies: {featureServices: featureServiceDependencies}
  };

  if (featureServiceDefinitions) {
    featureServiceRegistry.registerFeatureServices(
      featureServiceDefinitions,
      integratorDefinition.id
    );
  }

  const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
    configs: featureAppConfigs,
    externalsValidator,
    moduleLoader
  });

  const {featureServices} = featureServiceRegistry.bindFeatureServices(
    integratorDefinition
  );

  return {featureAppManager, featureServiceRegistry, featureServices};
}
