import {
  DomFeatureApp,
  FeatureApp,
  ReactFeatureApp
} from '../feature-app-container';

export function isDomFeatureApp(featureApp: {
  [key: string]: unknown;
}): featureApp is DomFeatureApp {
  return typeof featureApp.attachTo === 'function';
}

export function isReactFeatureApp(featureApp: {
  [key: string]: unknown;
}): featureApp is ReactFeatureApp {
  return typeof featureApp.render === 'function';
}

export function isFeatureApp(featureApp: unknown): featureApp is FeatureApp {
  if (typeof featureApp !== 'object' || !featureApp) {
    return false;
  }

  return isDomFeatureApp(featureApp) || isReactFeatureApp(featureApp);
}
