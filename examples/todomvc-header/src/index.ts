import {FeatureAppDefinition} from '@feature-hub/core';
import {DomFeatureApp} from '@feature-hub/react';
import {TodoManagerV1} from '@feature-hub/todomvc-todo-manager';
import {TodoMvcHeader} from './todomvc-header';

const featureAppDefinition: FeatureAppDefinition<DomFeatureApp> = {
  id: 's2:todomvc-header',

  dependencies: {
    's2:todomvc-todo-manager': '1.0'
  },

  create: ({featureServices}) => {
    const todoManager = featureServices[
      's2:todomvc-todo-manager'
    ] as TodoManagerV1;

    return new TodoMvcHeader(todoManager);
  }
};

export default featureAppDefinition;
