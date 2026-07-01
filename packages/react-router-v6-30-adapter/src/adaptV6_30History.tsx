import {
  type History as RemixHistory,
  Action as RemixAction,
  type Path as RemixPath,
  type To as RemixTo,
  type Location as RemixLocation,
} from '@remix-run/router';
import type {History} from 'history';

function mapAction(action: string): RemixAction {
  return action === 'PUSH'
    ? RemixAction.Push
    : action === 'REPLACE'
      ? RemixAction.Replace
      : RemixAction.Pop;
}

function toPathname(to: RemixTo): string {
  return typeof to === 'string'
    ? to
    : `${to.pathname || '/'}${to.search || ''}${to.hash || ''}`;
}

function toPath(to: RemixTo): RemixPath {
  const pathname = typeof to === 'string' ? to : to.pathname || '/';
  const search = typeof to === 'string' ? '' : to.search || '';
  const hash = typeof to === 'string' ? '' : to.hash || '';
  return {pathname, search, hash};
}
interface RemixUpdate {
  /**
   * The action that triggered the change.
   */
  action: RemixAction;
  /**
   * The new location.
   */
  location: RemixLocation;
  /**
   * The delta between this location and the former location in the history stack
   */
  delta: number | null;
}

export function adaptV6_30History(history: History): RemixHistory {
  return {
    get action() {
      return mapAction(history.action);
    },
    get location() {
      const loc = history.location;
      return {
        pathname: loc.pathname,
        search: loc.search,
        hash: loc.hash,
        state: loc.state,
        key: loc.key || 'default',
      };
    },
    createHref(to: RemixTo) {
      return toPathname(to);
    },
    createURL(to: RemixTo) {
      const href = this.createHref(to);
      return new URL(href, window.location.href);
    },
    encodeLocation(to: RemixTo): RemixPath {
      return toPath(to);
    },
    // biome-ignore lint/suspicious/noExplicitAny: test case
    push(to: RemixTo, state?: any) {
      history.push(toPathname(to), state);
    },
    // biome-ignore lint/suspicious/noExplicitAny: test case
    replace(to: RemixTo, state?: any) {
      history.replace(toPathname(to), state);
    },
    go(delta: number) {
      history.go(delta);
    },
    listen(listener: (update: RemixUpdate) => void): () => void {
      return history.listen(({location, action}) => {
        listener({
          action: mapAction(action),
          location: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            state: location.state,
            key: location.key || 'default',
          },
          delta: null,
        });
      });
    },
  };
}
