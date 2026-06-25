/* istanbul ignore next (not fully coverable on Node versions > 8) */
const URLSearchParamsPonyfill: typeof URLSearchParams =
  typeof URLSearchParams === 'undefined' && typeof window === 'undefined'
    ? // biome-ignore lint/security/noGlobalEval: compatibility shim
      eval('require')('url').URLSearchParams
    : URLSearchParams;

export {URLSearchParamsPonyfill as URLSearchParams};
