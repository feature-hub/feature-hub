import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {defineHistoryService} from '@feature-hub/history-service';
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
import {FeatureAppContainer} from '@feature-hub/react';
import {defineServerRequest} from '@feature-hub/server-request';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import {rootLocationTransformer} from '../root-location-transformer';
import {MainHtmlRendererOptions} from '../start-server';
import {historyConsumerDefinition} from './history-consumer-definition';

export default async function renderMainHtml({
  req
}: MainHtmlRendererOptions): Promise<string> {
  const featureServiceRegistry = new FeatureServiceRegistry();

  const featureServiceDefinitions = [
    defineServerRequest(req),
    defineHistoryService(rootLocationTransformer)
  ];

  featureServiceRegistry.registerFeatureServices(
    featureServiceDefinitions,
    'demos:integrator'
  );

  const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
    moduleLoader: loadCommonJsModule
  });

  return ReactDOM.renderToString(
    <>
      <FeatureAppContainer
        featureAppManager={featureAppManager}
        featureAppDefinition={historyConsumerDefinition}
        idSpecifier="a"
      />
      <FeatureAppContainer
        featureAppManager={featureAppManager}
        featureAppDefinition={historyConsumerDefinition}
        idSpecifier="b"
      />
    </>
  );
}
