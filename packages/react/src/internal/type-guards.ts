import {
  DomFeatureApp,
  FeatureApp,
  ReactFeatureApp,
} from '../feature-app-container';

export function isDomFeatureApp(
  featureApp: object
): featureApp is DomFeatureApp {
  return typeof (featureApp as DomFeatureApp).attachTo === 'function';
}

export function isReactFeatureApp(
  featureApp: object
): featureApp is ReactFeatureApp {
  return typeof (featureApp as ReactFeatureApp).render === 'function';
}

export function isFeatureApp(featureApp: unknown): featureApp is FeatureApp {
  if (typeof featureApp !== 'object' || !featureApp) {
    return false;
  }

  return isDomFeatureApp(featureApp) || isReactFeatureApp(featureApp);
}
