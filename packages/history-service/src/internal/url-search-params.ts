/* istanbul ignore next (not fully coverable on Node 10) */
const URLSearchParamsPonyfill: typeof URLSearchParams =
  typeof URLSearchParams === 'undefined' && typeof window === 'undefined'
    ? // tslint:disable-next-line:no-var-requires no-require-imports
      require('url').URLSearchParams
    : URLSearchParams;

export {URLSearchParamsPonyfill as URLSearchParams};
