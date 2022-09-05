import * as history from 'history';
import resolvePathname from 'resolve-pathname';

export function createHistoryPath(
  pathOrLocation: string | Partial<history.Location>,
  currentPathname: string = ``
): history.Path {
  const path =
    typeof pathOrLocation === 'string'
      ? pathOrLocation
      : history.createPath(pathOrLocation);

  /* istanbul ignore next */
  const {pathname = '', search = '', hash = ''} = history.parsePath(
    path.startsWith('/') ? path : resolvePathname(path, currentPathname)
  );

  return {pathname, search, hash};
}
