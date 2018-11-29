import {FeatureAppDefinition} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';
import {TodoBucketV1} from '@vwa/feature-services';
import * as React from 'react';
import {TodoMvcMain} from './todomvc-main';

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
	id: 's2:demo-todo-main',

	dependencies: {
		's2:demo-todo-bucket': '1.0'
	},

	create: ({featureServices}) => {
		const todoBucket = featureServices['s2:demo-todo-bucket'] as TodoBucketV1;
		todoBucket.add('Implement SSR');
		todoBucket.add('Fix Bugs');

		return {
			render: () => <TodoMvcMain todoBucket={todoBucket} />
		};
	}
};

export default featureAppDefinition;
