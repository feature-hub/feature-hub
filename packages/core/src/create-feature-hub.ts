import {ExternalsValidator, ProvidedExternals} from './externals-validator';
import {
  FeatureAppConfigs,
  FeatureAppManager,
  ModuleLoader
} from './feature-app-manager';
import {
  FeatureServiceConsumerDefinition,
  FeatureServiceConsumerDependencies,
  FeatureServiceProviderDefinition,
  FeatureServiceRegistry,
  FeatureServices,
  SharedFeatureService
} from './feature-service-registry';
import {Logger} from './logger';

export interface FeatureHub {
  /**
   * The [[FeatureAppManager]] singleton instance.
   */
  readonly featureAppManager: FeatureAppManager;

  /**
   * The [[FeatureServiceRegistry]] singleton instance.
   */
  readonly featureServiceRegistry: FeatureServiceRegistry;

  /**
   * The Feature Services that are bound to the integrator based on the
   * [[FeatureHubOptions.featureServiceDependencies]].
   */
  readonly featureServices: FeatureServices;
}

export interface FeatureHubOptions {
  /**
   * Configurations for all Feature Apps that will potentially be created.
   */
  readonly featureAppConfigs?: FeatureAppConfigs;

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
   * For the [[FeatureAppManager]] to be able to load Feature Apps from a
   * remote location, a module loader must be provided, (e.g. the
   * `@feature-hub/module-loader-amd` package or the
   * `@feature-hub/module-loader-commonjs` package).
   */
  readonly moduleLoader?: ModuleLoader;

  /**
   * A custom logger that shall be used instead of `console`.
   */
  readonly logger?: Logger;
}

/**
 * Creates the [[FeatureServiceRegistry]] singleton instance, registers all
 * [[FeatureHubOptions.featureServiceDefinitions]] for the given integrator
 * ID, and instantiates a [[FeatureAppManager]] singleton instance using
 * the [[FeatureServiceRegistry]].
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
    featureServiceDefinitions,
    featureServiceDependencies,
    providedExternals,
    moduleLoader,
    logger
  } = options;

  let externalsValidator: ExternalsValidator | undefined;

  if (providedExternals) {
    externalsValidator = new ExternalsValidator(providedExternals);
  }

  const featureServiceRegistry = new FeatureServiceRegistry({
    externalsValidator,
    logger
  });

  const integratorDefinition: FeatureServiceConsumerDefinition = {
    dependencies: {featureServices: featureServiceDependencies}
  };

  if (featureServiceDefinitions) {
    featureServiceRegistry.registerFeatureServices(
      featureServiceDefinitions,
      integratorId
    );
  }

  const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
    configs: featureAppConfigs,
    externalsValidator,
    moduleLoader,
    logger
  });

  const {featureServices} = featureServiceRegistry.bindFeatureServices(
    integratorDefinition,
    integratorId
  );

  return {featureAppManager, featureServiceRegistry, featureServices};
}
