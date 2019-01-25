const URLSearchParamsPonyfill: typeof URLSearchParams =
  typeof URLSearchParams === 'undefined' && typeof window === 'undefined'
    ? // tslint:disable-next-line:no-eval https://stackoverflow.com/a/41063795/10385541
      eval('require')('url').URLSearchParams
    : URLSearchParams;

export {URLSearchParamsPonyfill as URLSearchParams};
