import {FeatureAppDefinition} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';
import {TodoBucketV1} from '@vwa/feature-services';
import * as React from 'react';
import Loadable from 'react-loadable';
import {TodoMvcFooterProps} from './todomvc-footer';

const loadableOptions: Loadable.OptionsWithoutRender<TodoMvcFooterProps> = {
	loading: () => null,

	async loader(): Promise<React.ComponentType<TodoMvcFooterProps>> {
		return (await import('./todomvc-footer')).TodoMvcFooter;
	}
};

const LoadableTodoMvcFooter = Loadable(loadableOptions);

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
	id: 's2:demo-todo-footer',

	dependencies: {
		's2:demo-todo-bucket': '1.0'
	},

	create: ({config, featureServices}) => {
		// TODO: validate config (maybe use https://github.com/woutervh-/typescript-is)
		// tslint:disable-next-line:no-any
		__webpack_public_path__ = (config as any).publicPath;

		const todoBucket = featureServices['s2:demo-todo-bucket'] as TodoBucketV1;

		return {
			render: () => <LoadableTodoMvcFooter todoBucket={todoBucket} />
		};
	}
};

export default featureAppDefinition;
