import {createFeatureHub} from '@feature-hub/core';
import {loadFederationModule} from '@feature-hub/module-loader-federation';
import {FeatureAppLoader, FeatureHubContextProvider} from '@feature-hub/react';
import * as React from 'react';
import {createRoot} from 'react-dom/client';
import '../blueprint-css';

const {featureAppManager} = createFeatureHub('test:integrator', {
  moduleLoader: loadFederationModule,
});

const {origin} = window.location;
const src = `${origin}/remotes`;

const container = document.querySelector('main');

if (container) {
  createRoot(container).render(
    <FeatureHubContextProvider value={{featureAppManager}}>
      <FeatureAppLoader
        featureAppId="test:hello-world-1"
        src={src}
        exposedModule="feature/one"
      />
      <FeatureAppLoader
        featureAppId="test:hello-world-2"
        src={src}
        exposedModule="featureTwo"
      />
      <FeatureAppLoader
        featureAppId="test:hello-world-1-2"
        src={src + '-2'}
        exposedModule="feature/one"
      />
      <FeatureAppLoader
        featureAppId="test:hello-world-3"
        src={src + '-2'}
        exposedModule="feature/three"
      />
    </FeatureHubContextProvider>,
  );
}
