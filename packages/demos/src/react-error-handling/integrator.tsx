import {Callout, H4, Intent} from '@blueprintjs/core';
import {createFeatureHub} from '@feature-hub/core';
import {loadAmdModule} from '@feature-hub/module-loader-amd';
import {FeatureAppLoader, FeatureHubContextProvider} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';

const {featureAppManager} = createFeatureHub('test:integrator', {
  moduleLoader: loadAmdModule
});

function Error({error}: {error: Error}): JSX.Element {
  return (
    <Callout intent={Intent.DANGER}>
      <H4>Example Error UI</H4>
      <p>{error.message}</p>
    </Callout>
  );
}

ReactDOM.render(
  <div style={{padding: '20px'}}>
    <FeatureHubContextProvider value={{featureAppManager}}>
      <FeatureAppLoader
        featureAppId="test:invalid"
        src="feature-app.umd.js"
        onError={console.warn}
        renderError={error => <Error error={error} />}
      />
    </FeatureHubContextProvider>
  </div>,
  document.querySelector('main')
);
