import * as React from 'react';
import {FeatureHubContextConsumer} from './feature-hub-context';
import {InternalFeatureAppLoader} from './internal/feature-app-loader';

export interface Css {
  readonly href: string;
  readonly media?: string;
}

export interface FeatureAppLoaderProps {
  readonly src: string;
  readonly serverSrc?: string;
  readonly css?: Css[];
  readonly idSpecifier?: string;
}

export function FeatureAppLoader(props: FeatureAppLoaderProps): JSX.Element {
  return (
    <FeatureHubContextConsumer>
      {({featureAppManager, asyncSsrManager}) => (
        <InternalFeatureAppLoader
          featureAppManager={featureAppManager}
          asyncSsrManager={asyncSsrManager}
          {...props}
        />
      )}
    </FeatureHubContextConsumer>
  );
}
