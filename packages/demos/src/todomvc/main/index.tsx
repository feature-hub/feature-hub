import {FeatureAppDefinition} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import {TodoManagerV1} from '../todo-manager';
import {TodoMvcMain} from './todomvc-main';

interface Dependencies {
  'test:todomvc-todo-manager': TodoManagerV1;
}

const featureAppDefinition: FeatureAppDefinition<
  ReactFeatureApp,
  undefined,
  undefined,
  Dependencies
> = {
  id: 's2:todomvc-main',

  dependencies: {
    featureServices: {
      'test:todomvc-todo-manager': '^1.0.0'
    }
  },

  create: ({featureServices}) => {
    const todoManager = featureServices['test:todomvc-todo-manager'];

    return {
      render: () => <TodoMvcMain todoManager={todoManager} />
    };
  }
};

export default featureAppDefinition;
