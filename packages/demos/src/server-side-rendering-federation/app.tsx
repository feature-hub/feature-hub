import {FeatureAppLoader} from '@feature-hub/react';
import * as React from 'react';

export interface AppProps {
  readonly port?: number;
}

export function App({port}: AppProps): JSX.Element {
  return (
    <FeatureAppLoader
      featureAppId="test:hello-world"
      src="remoteEntry-client.js"
      serverSrc={port ? `http://localhost:${port}/bundle.zip` : ''}
    />
  );
}
