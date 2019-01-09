export interface ServerRendererConfig {
  timeout?: number;
}

function isValidConfig(
  config: unknown
): config is ServerRendererConfig | undefined {
  if (typeof config === 'undefined') {
    return true;
  }

  if (typeof config !== 'object' || !config) {
    return false;
  }

  const {timeout} = config as ServerRendererConfig;

  return typeof timeout === 'undefined' || typeof timeout === 'number';
}

export function validateConfig(
  config: unknown
): ServerRendererConfig | undefined {
  if (!isValidConfig(config)) {
    throw new Error('The ServerRenderer config is invalid.');
  }

  return config;
}
