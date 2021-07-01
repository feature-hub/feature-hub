import {Css} from '@feature-hub/react';
import express from 'express';

export interface AppRendererOptions {
  readonly port: number;
  readonly req: express.Request;
}

export interface FeatureAppModuleSource {
  readonly url: string;
  readonly moduleType?: string;
}

export interface AppRendererResult {
  readonly html: string;
  readonly serializedStates?: string;
  readonly stylesheetsForSsr?: Map<string, Css>;
  readonly hydrationSources?: Map<string, FeatureAppModuleSource>;
}

export type AppRenderer = (
  options: AppRendererOptions
) => Promise<AppRendererResult>;
