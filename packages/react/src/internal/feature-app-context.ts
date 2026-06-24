import * as React from 'react';
import type {FeatureAppDescriptor} from './internal-feature-app-container';

export const FeatureAppContext = React.createContext<
  FeatureAppDescriptor | undefined
>(undefined);
