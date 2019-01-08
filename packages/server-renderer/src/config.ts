export interface ServerRendererConfig {
  rerenderWait: number;
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

  const {rerenderWait} = config as ServerRendererConfig;

  return (
    typeof rerenderWait === 'undefined' || typeof rerenderWait === 'number'
  );
}

export function validateConfig(
  config: unknown
): ServerRendererConfig | undefined {
  if (!isValidConfig(config)) {
    throw new Error('The ServerRenderer config is invalid.');
  }

  return config;
}
