import {ExternalsValidator, ProvidedExternals} from './externals-validator';
import {
  FeatureAppManager,
  ModuleLoader,
  OnBindParams,
} from './feature-app-manager';
import {
  FeatureServiceConsumerDefinition,
  FeatureServiceConsumerDependencies,
  FeatureServiceProviderDefinition,
  FeatureServiceRegistry,
  FeatureServices,
  SharedFeatureService,
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
   * For the `FeatureAppManager` to be able to load Feature Apps from a remote
   * location, a module loader must be provided. This can either be one of the
   * module loaders that are provided by @feature-hub, i.e.
   * `@feature-hub/module-loader-amd`, `@feature-hub/module-loader-federation`,
   * and `@feature-hub/module-loader-commonjs`, or a custom loader.
   */
  readonly moduleLoader?: ModuleLoader;

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
    featureServiceDefinitions,
    featureServiceDependencies,
    providedExternals,
    moduleLoader,
    logger,
    onBind,
  } = options;

  let externalsValidator: ExternalsValidator | undefined;

  if (providedExternals) {
    externalsValidator = new ExternalsValidator(providedExternals);
  }

  const featureServiceRegistry = new FeatureServiceRegistry({
    externalsValidator,
    logger,
  });

  const integratorDefinition: FeatureServiceConsumerDefinition = {
    dependencies: {featureServices: featureServiceDependencies},
  };

  if (featureServiceDefinitions) {
    featureServiceRegistry.registerFeatureServices(
      featureServiceDefinitions,
      integratorId
    );
  }

  const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
    externalsValidator,
    moduleLoader,
    logger,
    onBind,
  });

  const {featureServices} = featureServiceRegistry.bindFeatureServices(
    integratorDefinition,
    integratorId
  );

  return {featureAppManager, featureServiceRegistry, featureServices};
}
