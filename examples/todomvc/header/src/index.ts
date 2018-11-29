import {FeatureAppDefinition} from '@feature-hub/core';
import {DomFeatureApp} from '@feature-hub/react';
import {TodoBucketV1} from 'todomvc-todo-manager';
import {TodoMvcHeader} from './todomvc-header';

const featureAppDefinition: FeatureAppDefinition<DomFeatureApp> = {
  id: 's2:demo-todo-header',

  dependencies: {
    's2:demo-todo-bucket': '1.0'
  },

  create: ({featureServices}) => {
    const todoBucket = featureServices['s2:demo-todo-bucket'] as TodoBucketV1;

    return new TodoMvcHeader(todoBucket);
  }
};

export default featureAppDefinition;
