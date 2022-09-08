import {FeatureAppLoader} from '@feature-hub/react';
import * as React from 'react';
import {Route, Routes} from 'react-router';

export function App(): JSX.Element {
  return (
    <>
      <FeatureAppLoader
        featureAppId="test:input"
        src="input-feature-app.umd.js"
      />
      <Routes>
        <Route
          path="page2"
          element={
            <FeatureAppLoader
              featureAppId="test:hello-world"
              src="hello-world-feature-app.umd.js"
            />
          }
        />
      </Routes>
    </>
  );
}
