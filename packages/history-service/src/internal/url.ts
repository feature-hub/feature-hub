/* istanbul ignore next (not fully coverable on Node versions > 8) */
const URLPonyfill: typeof URL =
  typeof URL === 'undefined' && typeof window === 'undefined'
    ? // biome-ignore lint/security/noGlobalEval: compatibility shim
      eval('require')('url').URL
    : URL;

export {URLPonyfill as URL};
