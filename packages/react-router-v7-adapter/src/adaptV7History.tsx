import type {
  HistoryRouterProps,
  Path as PathV7,
  To as ToV7,
  Location as LocationV7,
} from 'react-router';
import {Action, type History} from 'history';

type HistoryV7 = HistoryRouterProps['history'];

function mapAction(action: string): Action {
  return action === 'PUSH'
    ? Action.Push
    : action === 'REPLACE'
      ? Action.Replace
      : Action.Pop;
}

function toPathname(to: ToV7): string {
  return typeof to === 'string'
    ? to
    : `${to.pathname || '/'}${to.search || ''}${to.hash || ''}` || '/';
}

function toPath(to: ToV7): PathV7 {
  const pathname = typeof to === 'string' ? to : to.pathname || '/';
  const search = typeof to === 'string' ? '' : to.search || '';
  const hash = typeof to === 'string' ? '' : to.hash || '';
  return {pathname, search, hash};
}
interface UpdateV7 {
  /**
   * The action that triggered the change.
   */
  action: Action;
  /**
   * The new location.
   */
  location: LocationV7;
  /**
   * The delta between this location and the former location in the history stack
   */
  delta: number | null;
}

export function adaptV7History(history: History): HistoryV7 {
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
    createHref(to: ToV7) {
      return toPathname(to);
    },
    createURL(to: ToV7) {
      const href = this.createHref(to);
      return new URL(href, window.location.href);
    },
    encodeLocation(to: ToV7): PathV7 {
      return toPath(to);
    },
    // biome-ignore lint/suspicious/noExplicitAny: test case
    push(to: ToV7, state?: any) {
      history.push(toPathname(to), state);
    },
    // biome-ignore lint/suspicious/noExplicitAny: test case
    replace(to: ToV7, state?: any) {
      history.replace(toPathname(to), state);
    },
    go(delta: number) {
      history.go(delta);
    },
    listen(listener: (update: UpdateV7) => void): () => void {
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
