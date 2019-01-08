import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import {FeatureAppLoader} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';

// TODO: Remove server renderer config when optional dependencies have landed:
// https://github.com/sinnerschrader/feature-hub/issues/24
const configs = {'s2:server-renderer': {timeout: 0}};
const registry = new FeatureServiceRegistry({configs});
const manager = new FeatureAppManager(registry, {moduleLoader: loadAmdModule});

defineExternals({react: React});

ReactDOM.render(
  <FeatureAppLoader manager={manager} src="feature-app.umd.js" />,
  document.querySelector('main')
);
