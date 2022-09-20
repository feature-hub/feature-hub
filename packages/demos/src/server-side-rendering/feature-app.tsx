import {AsyncSsrManagerV1} from '@feature-hub/async-ssr-manager';
import {FeatureAppDefinition, FeatureServices} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';
import {SerializedStateManagerV1} from '@feature-hub/serialized-state-manager';
import * as React from 'react';
import {HelloWorld} from './hello-world';

interface Dependencies extends FeatureServices {
  readonly 's2:async-ssr-manager': AsyncSsrManagerV1 | undefined;
  readonly 's2:serialized-state-manager': SerializedStateManagerV1;
}

async function fetchSubject(): Promise<string> {
  return 'Universe';
}

const featureAppDefinition: FeatureAppDefinition<
  ReactFeatureApp,
  Dependencies
> = {
  dependencies: {
    featureServices: {'s2:serialized-state-manager': '^1.0.0'},
  },

  optionalDependencies: {
    featureServices: {'s2:async-ssr-manager': '^1.0.0'},
  },

  create: (env) => {
    let subject = 'World';

    const asyncSsrManager = env.featureServices['s2:async-ssr-manager'];

    const serializedStateManager =
      env.featureServices['s2:serialized-state-manager'];

    // We use the presence of the asyncSsrManager to determine whether we are
    // rendered on the server or on the client.
    if (asyncSsrManager) {
      serializedStateManager.register(() => subject);

      asyncSsrManager.scheduleRerender(
        (async () => (subject = await fetchSubject()))()
      );
    } else {
      const serializedSubject = serializedStateManager.getSerializedState();

      if (serializedSubject) {
        subject = serializedSubject;
      }
    }

    return {
      render: () => <HelloWorld subject={subject} />,
    };
  },
};

export default featureAppDefinition;
