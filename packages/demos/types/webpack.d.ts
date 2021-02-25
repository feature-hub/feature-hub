import * as webpack from 'webpack';

declare module 'webpack' {
  namespace loader {
    // Stub to avoid compiler error in ts-loader types.
    interface LoaderContext {}
  }

  namespace Stats {
    // Work-around for https://github.com/DefinitelyTyped/DefinitelyTyped/pull/50802
    type ToJsonOptions = Parameters<webpack.Stats['toJson']>[0];
  }
}
