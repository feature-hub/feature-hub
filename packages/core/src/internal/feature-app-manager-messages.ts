import {ModuleLoader} from '../feature-app-manager';

export function invalidFeatureAppModule(
  url: string,
  moduleType: string | undefined,
  moduleLoader: ModuleLoader | undefined
): string {
  let message = `The Feature App module at the url ${JSON.stringify(url)} ${
    moduleType
      ? `with the module type ${JSON.stringify(moduleType)}`
      : `with no specific module type`
  } is invalid. A Feature App module must have a Feature App definition as default export. A Feature App definition is an object with at least a \`create\` method.`;

  if (moduleLoader && moduleLoader.length > 1 && !moduleType) {
    message +=
      ' Hint: The provided module loader expects an optional second parameter `moduleType`. It might need to be provided for this Feature App.';
  }

  return message;
}
