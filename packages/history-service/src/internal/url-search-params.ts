const _URLSearchParams: typeof URLSearchParams =
  typeof URLSearchParams === 'undefined' && typeof window === 'undefined'
    ? // tslint:disable-next-line:no-var-requires no-require-imports
      require('url').URLSearchParams
    : URLSearchParams;

export default _URLSearchParams;
