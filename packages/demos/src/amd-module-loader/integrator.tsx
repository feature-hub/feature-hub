import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader';
import {FeatureAppLoader} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '../blueprint-css';

const registry = new FeatureServiceRegistry();
const manager = new FeatureAppManager(registry, {moduleLoader: loadAmdModule});

defineExternals({react: React});

ReactDOM.render(
  <FeatureAppLoader manager={manager} src="feature-app.umd.js" />,
  document.querySelector('main')
);
