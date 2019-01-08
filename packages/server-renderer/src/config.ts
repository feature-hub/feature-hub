export interface ServerRendererConfig {
  timeout: number;
}

function isValidConfig(config: unknown): config is ServerRendererConfig {
  if (typeof config !== 'object' || !config) {
    return false;
  }

  const {timeout} = config as ServerRendererConfig;

  return typeof timeout === 'number';
}

export function validateConfig(config: unknown): ServerRendererConfig {
  if (!isValidConfig(config)) {
    throw new Error('The ServerRenderer config is invalid.');
  }

  return config;
}
