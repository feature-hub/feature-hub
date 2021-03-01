// @ts-check

/**
 * @param {string} source
 * @return {unknown}
 */
function evalNodeSource(source) {
  const mod = {exports: {}};

  // tslint:disable-next-line:function-constructor
  Function('module', 'exports', 'require', source)(mod, mod.exports, require);

  return mod.exports;
}

/**
 * @param {unknown} value
 * @return {value is Record<string, unknown>}
 */
function isObject(value) {
  return typeof value === 'object' && value !== null;
}

/**
 * @param {unknown} value
 * @return {value is {default: Function}}
 */
function hasDefaultFunction(value) {
  return isObject(value) && typeof value.default === 'function';
}

/**
 * @param {import('express').Response} res
 * @param {string} nodeIntegratorFilename
 * @return {import('./app-renderer').AppRenderer | undefined}
 */
function loadNodeIntegrator(res, nodeIntegratorFilename) {
  try {
    /** @type {import('webpack').Compiler['outputFileSystem'] & import('fs')} */
    const outputFileSystem = res.locals.webpack.devMiddleware.outputFileSystem;
    const statsJson = res.locals.webpack.devMiddleware.stats.toJson();

    /** @type {string | undefined} */
    const outputPath =
      typeof statsJson === 'object' ? statsJson.outputPath : undefined;

    if (!outputPath || !outputFileSystem.join) {
      return undefined;
    }

    const source = outputFileSystem
      .readFileSync(outputFileSystem.join(outputPath, nodeIntegratorFilename))
      .toString();

    const evaluatedModule = evalNodeSource(source);

    return hasDefaultFunction(evaluatedModule)
      ? /** @type {import('./app-renderer').AppRenderer} */
        (evaluatedModule.default)
      : undefined;
  } catch {
    return undefined;
  }
}

module.exports = {loadNodeIntegrator};
