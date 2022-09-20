import {FeatureAppDefinition, FeatureServices} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import {TodoManagerV1} from '../todo-manager';
import {TodoMvcFooter} from './todomvc-footer';

export interface FooterFeatureServices extends FeatureServices {
  readonly 'test:todomvc-todo-manager': TodoManagerV1;
}

const featureAppDefinition: FeatureAppDefinition<
  ReactFeatureApp,
  FooterFeatureServices
> = {
  dependencies: {
    featureServices: {'test:todomvc-todo-manager': '^1.0.0'},
  },

  create: ({featureServices}) => {
    const todoManager = featureServices['test:todomvc-todo-manager'];

    return {
      render: () => <TodoMvcFooter todoManager={todoManager} />,
    };
  },
};

export default featureAppDefinition;
