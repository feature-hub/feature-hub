import {FeatureAppDefinition} from '@feature-hub/core';
import {DomFeatureApp} from '@feature-hub/react';
import {TodoManagerV1} from '../todo-manager';
import {TodoMvcHeader} from './todomvc-header';

interface Dependencies {
  'test:todomvc-todo-manager': TodoManagerV1;
}

const featureAppDefinition: FeatureAppDefinition<
  DomFeatureApp,
  undefined,
  undefined,
  Dependencies
> = {
  id: 'test:todomvc-header',

  dependencies: {
    featureServices: {
      'test:todomvc-todo-manager': '^1.0.0'
    }
  },

  create: ({featureServices}) => {
    const todoManager = featureServices['test:todomvc-todo-manager'];

    return new TodoMvcHeader(todoManager);
  }
};

export default featureAppDefinition;
