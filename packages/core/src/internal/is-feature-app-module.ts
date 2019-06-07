import {FeatureAppDefinition} from '../feature-app-manager';

export interface FeatureAppModule {
  readonly default: FeatureAppDefinition<unknown>;
}

function isFeatureAppDefinition(
  // tslint:disable-next-line:no-any
  maybeFeatureAppDefinition: any
): maybeFeatureAppDefinition is FeatureAppDefinition<unknown> {
  if (
    typeof maybeFeatureAppDefinition !== 'object' ||
    !maybeFeatureAppDefinition
  ) {
    return false;
  }

  const featureAppDefinition = maybeFeatureAppDefinition as FeatureAppDefinition<
    unknown
  >;

  return typeof featureAppDefinition.create === 'function';
}

export function isFeatureAppModule(
  // tslint:disable-next-line:no-any
  maybeFeatureAppModule: any
): maybeFeatureAppModule is FeatureAppModule {
  if (typeof maybeFeatureAppModule !== 'object' || !maybeFeatureAppModule) {
    return false;
  }

  return isFeatureAppDefinition(
    (maybeFeatureAppModule as FeatureAppModule).default
  );
}
