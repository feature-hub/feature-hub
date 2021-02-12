import {FeatureAppLoader} from '@feature-hub/react';
import * as React from 'react';

export interface AppProps {
  readonly port?: number;
}

export function App({port}: AppProps): JSX.Element {
  return (
    <FeatureAppLoader
      featureAppId="test:hello-world"
      src="feature-app.js"
      serverSrc={port ? `http://localhost:${port}/feature-app-ssr.js` : ''}
      css={[
        {href: 'normalize.css'},
        {href: 'blueprint-icons.css'},
        {href: 'blueprint.css'},
      ]}
    />
  );
}
