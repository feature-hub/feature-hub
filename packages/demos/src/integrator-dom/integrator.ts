import {createFeatureHub} from '@feature-hub/core';
import {createFeatureAppLoader} from '@feature-hub/dom';
import {loadAmdModule} from '@feature-hub/module-loader-amd';

const {featureAppManager} = createFeatureHub('test:integrator', {
  moduleLoader: loadAmdModule
});

createFeatureAppLoader(featureAppManager);

const app = document.createElement('div');

app.innerHTML = `
  <feature-app-loader src="feature-app.umd.js">
    <div slot="loading">
      Loading...
    </div>
    <div slot="error">
      Sorry. We Messed Up.
    </div>
  </feature-app-loader>
`;

document.body.appendChild(app);
