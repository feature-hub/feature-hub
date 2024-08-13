import urljoin from 'url-join';

function isAbsolute(url: string): boolean {
  return /^https?:\/\//.test(url);
}

/**
 * Prepends the given `base` - which can be relative or absolute - to the `url`,
 * unless the `url` is absolute.
 */
export function prependBaseUrl(base: string | undefined, url: string): string {
  if (!base || isAbsolute(url)) {
    return url;
  }

  return urljoin(base, url);
}
