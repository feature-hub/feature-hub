import {Css} from '@feature-hub/react';
import express from 'express';
// import webpack from 'webpack';

export interface AppRendererOptions {
  readonly port: number;
  readonly req: express.Request;
}

export interface AppRendererResult {
  readonly html: string;
  readonly serializedStates?: string;
  readonly stylesheetsForSsr?: Map<string, Css>;
  readonly urlsForHydration?: Set<string>;
}

export type AppRenderer = (
  options: AppRendererOptions
) => Promise<AppRendererResult>;

// tslint:disable-next-line:no-any
function evalNodeSource(source: string): any {
  const mod = {exports: {}};

  // tslint:disable-next-line:function-constructor
  Function('module', 'exports', 'require', source)(mod, mod.exports, require);

  return mod.exports;
}

export function loadNodeIntegrator(
  res: express.Response,
  nodeIntegratorFilename: string
): AppRenderer | undefined {
  try {
    const outputFileSystem = res.locals.webpack.devMiddleware.outputFileSystem;

    const {outputPath} = res.locals.webpack.devMiddleware.stats.toJson();
    console.log('#####', outputPath, '/', nodeIntegratorFilename);

    const source = outputFileSystem
      .readFileSync(outputFileSystem.join(outputPath, nodeIntegratorFilename))
      .toString();

    return evalNodeSource(source).default;
  } catch (e) {
    console.error('cannot load integrator', e);
    return undefined;
  }
}
