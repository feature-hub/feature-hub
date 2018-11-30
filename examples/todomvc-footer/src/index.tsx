import {FeatureAppDefinition} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';
import {TodoManagerV1} from '@feature-hub/todomvc-todo-manager';
import * as React from 'react';
import {TodoMvcFooter} from './todomvc-footer';

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
  id: 's2:todomvc-footer',

  dependencies: {
    's2:todomvc-todo-manager': '1.0'
  },

  create: ({featureServices}) => {
    const todoManager = featureServices[
      's2:todomvc-todo-manager'
    ] as TodoManagerV1;

    return {
      render: () => <TodoMvcFooter todoManager={todoManager} />
    };
  }
};

export default featureAppDefinition;
