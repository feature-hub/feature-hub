import {FeatureAppLoader} from '@feature-hub/react';
import * as React from 'react';

export interface AppProps {
  readonly port?: number;
}

export function App({port}: AppProps): JSX.Element {
  return (
    <FeatureAppLoader
      src="feature-app.umd.js"
      serverSrc={port ? `http://localhost:${port}/feature-app.commonjs.js` : ''}
      css={[
        {href: 'normalize.css'},
        {href: 'blueprint-icons.css'},
        {href: 'blueprint.css'}
      ]}
    />
  );
}
