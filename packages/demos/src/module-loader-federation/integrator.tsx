import {createFeatureHub} from '@feature-hub/core';
import {
  WebpackInitSharing,
  WebpackShareScopes,
  loadFederationModuleFactory,
} from '@feature-hub/module-loader-federation';
import {FeatureAppLoader, FeatureHubContextProvider} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';

declare const __webpack_init_sharing__: WebpackInitSharing;
declare const __webpack_share_scopes__: WebpackShareScopes;

const {featureAppManager} = createFeatureHub('test:integrator', {
  moduleLoader: loadFederationModuleFactory(
    __webpack_init_sharing__,
    __webpack_share_scopes__
  ),
  providedExternals: {},
});

ReactDOM.render(
  <FeatureHubContextProvider value={{featureAppManager}}>
    <FeatureAppLoader featureAppId="test:hello-world" src="remoteEntry.js" />
  </FeatureHubContextProvider>,

  document.querySelector('main')
);
