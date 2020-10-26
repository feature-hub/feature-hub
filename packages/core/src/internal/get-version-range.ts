import {valid, validRange} from 'semver';

export function getVersionRange(
  versionOrRange: string | undefined
): string | undefined {
  if (!versionOrRange) {
    return undefined;
  }

  const range = validRange(versionOrRange.replace('~', '^'));

  if (valid(range)) {
    return `^${range}`;
  }

  return range || undefined;
}
