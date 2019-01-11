import {AsyncSsrManagerConfig} from '..';

function isValidConfig(
  config: unknown
): config is AsyncSsrManagerConfig | undefined {
  if (typeof config === 'undefined') {
    return true;
  }

  if (typeof config !== 'object' || !config) {
    return false;
  }

  const {timeout} = config as AsyncSsrManagerConfig;

  return typeof timeout === 'undefined' || typeof timeout === 'number';
}

export function validateConfig(
  config: unknown
): AsyncSsrManagerConfig | undefined {
  if (!isValidConfig(config)) {
    throw new Error('The Async SSR Manager config is invalid.');
  }

  return config;
}
