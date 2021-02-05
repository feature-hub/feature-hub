import {Css} from '@feature-hub/react';
import express from 'express';
import webpack from 'webpack';

export interface AppRendererOptions {
  port: number;
  req: express.Request;
}

export interface AppRendererResult {
  html: string;
  serializedStates?: string;
  stylesheetsForSsr?: Map<string, Css>;
  urlsForHydration?: Set<string>;
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

export const nodeIntegratorFilename = 'integrator.node.js';

export function loadNodeIntegrator(
  res: express.Response
): AppRenderer | undefined {
  try {
    const outputFileSystem: webpack.InputFileSystem & webpack.OutputFileSystem =
      res.locals.webpack.devMiddleware.outputFileSystem;

    const {outputPath} = res.locals.webpack.devMiddleware.stats.toJson();

    const source = outputFileSystem
      .readFileSync(outputFileSystem.join(outputPath, nodeIntegratorFilename))
      .toString();

    return evalNodeSource(source).default;
  } catch {
    return undefined;
  }
}
