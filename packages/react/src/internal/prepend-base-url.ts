import urljoin from 'url-join';

function isAbsolute(url: string): boolean {
  return /^https?:\/\//.test(url);
}

/**
 * Prepends the given `url` with the given `baseUrl` (can be relative or
 * absolute), unless `url` itself is absolute.
 */
export function prependBaseUrl(base: string | undefined, url: string): string {
  if (!base || isAbsolute(url)) {
    return url;
  }

  return urljoin(base, url);
}
