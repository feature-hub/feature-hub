// tslint:disable:no-implicit-dependencies

import {
  AsyncValue,
  FeatureAppDefinition,
  FeatureAppManager,
} from '@feature-hub/core';
import React from 'react';
import TestRenderer from 'react-test-renderer';
import {FeatureAppLoader, FeatureHubContextProvider} from '..';
import {DomFeatureApp} from '../feature-app-container';

describe('FeatureAppLoader with an unmocked InternalFeatureAppContainer', () => {
  let mockFeatureAppManager: FeatureAppManager;
  let mockAsyncFeatureAppDefinition: AsyncValue<FeatureAppDefinition<unknown>>;
  let mockAttachTo: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error');
    mockAttachTo = jest.fn();

    const domFeatureApp: DomFeatureApp = {attachTo: mockAttachTo};

    const mockFeatureAppDefinition: FeatureAppDefinition<DomFeatureApp> = {
      create: () => domFeatureApp,
    };

    mockAsyncFeatureAppDefinition = new AsyncValue(
      new Promise((resolve) =>
        setTimeout(() => resolve(mockFeatureAppDefinition))
      )
    );

    mockFeatureAppManager = ({
      getAsyncFeatureAppDefinition: () => mockAsyncFeatureAppDefinition,
      createFeatureAppScope: () => ({
        featureApp: domFeatureApp,
        release: jest.fn(),
      }),
      preloadFeatureApp: jest.fn(),
    } as Partial<FeatureAppManager>) as FeatureAppManager;
  });

  afterEach(() => {
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  const renderWithFeatureHubContext = (
    node: React.ReactNode,
    testRendererOptions?: TestRenderer.TestRendererOptions
  ) =>
    TestRenderer.create(
      <FeatureHubContextProvider
        value={{featureAppManager: mockFeatureAppManager}}
      >
        {node}
      </FeatureHubContextProvider>,
      testRendererOptions
    );

  describe('when a Feature App definition is loaded asynchronously', () => {
    describe('with a children render function', () => {
      describe('and a DOM Feature App', () => {
        it('calls attachTo of the DOM Feature App', async () => {
          renderWithFeatureHubContext(
            <FeatureAppLoader featureAppId="testId" src="example.js">
              {({featureAppNode}) => <div>{featureAppNode}</div>}
            </FeatureAppLoader>,
            {createNodeMock: () => ({})}
          );

          await mockAsyncFeatureAppDefinition.promise;

          expect(mockAttachTo).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
