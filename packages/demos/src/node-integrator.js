// @ts-check

/**
 * @param {string} source
 * @return {any}
 */
function evalNodeSource(source) {
  const mod = {exports: {}};

  // tslint:disable-next-line:function-constructor
  Function('module', 'exports', 'require', source)(mod, mod.exports, require);

  return mod.exports;
}

/**
 * @param {import('express').Response} res
 * @param {string} nodeIntegratorFilename
 * @return {import('./app-renderer').AppRenderer | undefined}
 */
function loadNodeIntegrator(res, nodeIntegratorFilename) {
  try {
    /** @type {import('webpack').InputFileSystem & import('webpack').OutputFileSystem} */
    const outputFileSystem = res.locals.webpack.devMiddleware.outputFileSystem;

    /** @type {import('webpack').Stats.ToJsonOutput} */
    const {outputPath} = res.locals.webpack.devMiddleware.stats.toJson();

    if (!outputPath) {
      return undefined;
    }

    const source = outputFileSystem
      .readFileSync(outputFileSystem.join(outputPath, nodeIntegratorFilename))
      .toString();

    return evalNodeSource(source).default;
  } catch {
    return undefined;
  }
}

module.exports = {loadNodeIntegrator};
