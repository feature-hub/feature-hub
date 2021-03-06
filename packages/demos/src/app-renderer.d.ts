import {Css} from '@feature-hub/react';
import express from 'express';

export interface AppRendererOptions {
  readonly port: number;
  readonly req: express.Request;
  readonly cache: Map<string, unknown>;
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
