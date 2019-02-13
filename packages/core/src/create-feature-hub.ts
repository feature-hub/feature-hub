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
  readonly featureAppManager: FeatureAppManagerLike;
  readonly featureServiceRegistry: FeatureServiceRegistryLike;
  readonly featureServices: FeatureServices;
}

export interface FeatureHubOptions {
  readonly featureAppConfigs?: FeatureAppConfigs;
  readonly featureServiceConfigs?: FeatureServiceConfigs;
  readonly featureServiceDefinitions?: FeatureServiceProviderDefinition<
    SharedFeatureService
  >[];
  readonly featureServiceDependencies?: FeatureServiceConsumerDependencies;
  readonly providedExternals?: ProvidedExternals;
  readonly moduleLoader?: ModuleLoader;
}

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
