import type {FeatureAppDefinition} from '../feature-app-manager';

export interface FeatureAppModule {
  readonly default: FeatureAppDefinition<unknown>;
}

function isFeatureAppDefinition(
  // biome-ignore lint/suspicious/noExplicitAny: runtime type guard
  maybeFeatureAppDefinition: any,
): maybeFeatureAppDefinition is FeatureAppDefinition<unknown> {
  if (
    typeof maybeFeatureAppDefinition !== 'object' ||
    !maybeFeatureAppDefinition
  ) {
    return false;
  }

  const featureAppDefinition =
    maybeFeatureAppDefinition as FeatureAppDefinition<unknown>;

  return typeof featureAppDefinition.create === 'function';
}

export function isFeatureAppModule(
  // biome-ignore lint/suspicious/noExplicitAny: runtime type guard
  maybeFeatureAppModule: any,
): maybeFeatureAppModule is FeatureAppModule {
  if (typeof maybeFeatureAppModule !== 'object' || !maybeFeatureAppModule) {
    return false;
  }

  return isFeatureAppDefinition(
    (maybeFeatureAppModule as FeatureAppModule).default,
  );
}
