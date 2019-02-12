import {
  ExternalsValidator,
  ExternalsValidatorLike,
  ProvidedExternals
} from './externals-validator';
import {
  FeatureAppConfigs,
  FeatureAppManager,
  ModuleLoader
} from './feature-app-manager';
import {
  FeatureServiceConfigs,
  FeatureServiceConsumerDefinition,
  FeatureServiceConsumerDependencies,
  FeatureServiceProviderDefinition,
  FeatureServiceRegistry,
  FeatureServices,
  SharedFeatureService
} from './feature-service-registry';

export interface FeatureHub {
  readonly featureAppManager: FeatureAppManager;
  readonly featureServiceRegistry: FeatureServiceRegistry;
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
    featureAppConfigs: providedFeatureAppConfigs,
    featureServiceConfigs: providedFeatureServiceConfigs,
    featureServiceDefinitions: providedFeatureServiceDefinitions,
    featureServiceDependencies,
    providedExternals: providedExternals,
    moduleLoader
  } = options;

  let externalsValidator: ExternalsValidatorLike | undefined;

  if (providedExternals) {
    externalsValidator = new ExternalsValidator(providedExternals);
  }

  const featureServiceRegistry = new FeatureServiceRegistry({
    configs: providedFeatureServiceConfigs,
    externalsValidator
  });

  const integratorDefinition: FeatureServiceConsumerDefinition = {
    id: integratorId,
    dependencies: {featureServices: featureServiceDependencies}
  };

  if (providedFeatureServiceDefinitions) {
    featureServiceRegistry.registerFeatureServices(
      providedFeatureServiceDefinitions,
      integratorDefinition.id
    );
  }

  const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
    configs: providedFeatureAppConfigs,
    externalsValidator,
    moduleLoader
  });

  const {featureServices} = featureServiceRegistry.bindFeatureServices(
    integratorDefinition
  );

  return {featureAppManager, featureServiceRegistry, featureServices};
}

/*
const someFeatureServiceDefinition1 = {
  id: 'acme:feature-service-1',
  create: jest.fn()
};

const featureHub = createFeatureHub('acme:integrator', {
  featureAppConfigs: {'acme:app': 'foo'},
  featureServiceConfigs: {[someFeatureServiceDefinition1.id]: 'bar'},
  featureServiceDefinitions: [someFeatureServiceDefinition1],
  featureServiceDependencies: {[someFeatureServiceDefinition1.id]: '^1.0.0'},
  providedExternals: {react: '16.7.0'},
  moduleLoader: {} as any
});

const someFeatureService1 =
  featureHub.featureServices[someFeatureServiceDefinition1.id];
*/
