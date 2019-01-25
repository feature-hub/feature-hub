const URLSearchParamsPonyfill: typeof URLSearchParams =
  typeof URLSearchParams === 'undefined' && typeof window === 'undefined'
    ? // tslint:disable-next-line:no-var-requires no-require-imports
      require('url').URLSearchParams
    : URLSearchParams;

export {URLSearchParamsPonyfill as URLSearchParams};
