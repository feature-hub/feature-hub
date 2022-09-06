import * as history from 'history';
import resolvePathname from 'resolve-pathname';

export function createHistoryPath(
  to: history.To,
  currentPathname: string = ``
): history.Path {
  const path = typeof to === 'string' ? to : history.createPath(to);

  /* istanbul ignore next */
  const {pathname = '', search = '', hash = ''} = history.parsePath(
    path.startsWith('/') ? path : resolvePathname(path, currentPathname)
  );

  return {pathname, search, hash};
}
