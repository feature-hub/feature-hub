/* istanbul ignore next (not fully coverable on Node versions > 8) */
const URLPonyfill: typeof URL =
  typeof URL === 'undefined' && typeof window === 'undefined'
    ? // tslint:disable-next-line:no-eval https://stackoverflow.com/a/41063795/10385541
      eval('require')('url').URL
    : URL;

export {URLPonyfill as URL};
