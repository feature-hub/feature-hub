import {FeatureAppDefinition, FeatureServices} from '@feature-hub/core';
import {DomFeatureApp} from '@feature-hub/react';
import {TodoManagerV1} from '../todo-manager';
import {TodoMvcHeader} from './todomvc-header';

export interface HeaderFeatureServices extends FeatureServices {
  readonly 'test:todomvc-todo-manager': TodoManagerV1;
}

const featureAppDefinition: FeatureAppDefinition<
  DomFeatureApp,
  HeaderFeatureServices
> = {
  dependencies: {
    featureServices: {'test:todomvc-todo-manager': '^1.0.0'},
  },

  create: ({featureServices}) => {
    const todoManager = featureServices['test:todomvc-todo-manager'];

    return new TodoMvcHeader(todoManager);
  },
};

export default featureAppDefinition;
