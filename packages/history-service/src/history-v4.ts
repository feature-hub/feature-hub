// Type definitions for history 4.7.2
// Project: https://github.com/mjackson/history
// Definitions by: Sergey Buturlakin <https://github.com/sergey-buturlakin>, Nathan Brown <https://github.com/ngbrown>, Young Rok Kim <https://github.com/rokoroku>, Daniel Nixon <https://github.com/danielnixon>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3
// tslint:disable

export type Action = 'PUSH' | 'POP' | 'REPLACE';
export type UnregisterCallback = () => void;

export interface History<HistoryLocationState = LocationState> {
  length: number;
  action: Action;
  location: Location<HistoryLocationState>;
  push(
    location: Path | LocationDescriptor<HistoryLocationState>,
    state?: HistoryLocationState
  ): void;
  replace(
    location: Path | LocationDescriptor<HistoryLocationState>,
    state?: HistoryLocationState
  ): void;
  go(n: number): void;
  goBack(): void;
  goForward(): void;
  block(
    prompt?: boolean | string | TransitionPromptHook<HistoryLocationState>
  ): UnregisterCallback;
  listen(listener: LocationListener<HistoryLocationState>): UnregisterCallback;
  createHref(location: LocationDescriptorObject<HistoryLocationState>): Href;
}

export interface Location<S = LocationState> {
  pathname: Pathname;
  search: Search;
  state: S;
  hash: Hash;
  key?: LocationKey | undefined;
}

export interface LocationDescriptorObject<S = LocationState> {
  pathname?: Pathname | undefined;
  search?: Search | undefined;
  state?: S | undefined;
  hash?: Hash | undefined;
  key?: LocationKey | undefined;
}

export type LocationDescriptor<S = LocationState> =
  | Path
  | LocationDescriptorObject<S>;
export type LocationKey = string;
export type LocationListener<S = LocationState> = (
  location: Location<S>,
  action: Action
) => void;

export type LocationState = unknown;
export type Path = string;
export type Pathname = string;
export type Search = string;
export type TransitionHook<S = LocationState> = (
  location: Location<S>,
  callback: (result: any) => void
) => any;
export type TransitionPromptHook<S = LocationState> = (
  location: Location<S>,
  action: Action
) => string | false | void;
export type Hash = string;
export type Href = string;
