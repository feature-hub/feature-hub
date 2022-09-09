import {Callout, Card, H4, Intent, Spinner} from '@blueprintjs/core';
import {createFeatureHub} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import {FeatureAppLoader, FeatureHubContextProvider} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';

defineExternals({react: React});

const {featureAppManager} = createFeatureHub('test:integrator', {
  moduleLoader: loadAmdModule,
  providedExternals: {react: process.env.REACT_VERSION as string},
});

function ErrorUi({error}: {error: unknown}): JSX.Element {
  return (
    <Callout intent={Intent.DANGER}>
      <H4>Example Error UI</H4>
      <p>{error instanceof Error ? error.message : error}</p>
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
      >
        {({error, featureAppNode, loading}) => {
          if (error) {
            return <ErrorUi error={error} />;
          }

          return (
            <Card>
              <div style={{display: loading ? 'none' : 'initial'}}>
                {featureAppNode}
              </div>
              {loading && (
                <div>
                  <Spinner />
                  Example Loading UI…
                </div>
              )}
            </Card>
          );
        }}
      </FeatureAppLoader>
    </FeatureHubContextProvider>
  </div>,
  document.querySelector('main')
);
