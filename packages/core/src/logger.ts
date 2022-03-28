import {FeatureServiceConsumerDependencies} from './feature-service-registry';

export interface Logger {
  trace(message?: unknown, ...optionalParams: unknown[]): void;
  debug(message?: unknown, ...optionalParams: unknown[]): void;
  info(message?: unknown, ...optionalParams: unknown[]): void;
  warn(message?: unknown, ...optionalParams: unknown[]): void;
  error(message?: unknown, ...optionalParams: unknown[]): void;
  /**
   * The usage of featurehub is tracked. This can observed and analysed by integrators.
   * @param event
   */
  track(event: TrackingEvent): void;
}

export interface TrackingEvent {
  type: 'FeatureAppCreation';
  optionalDependencies?: FeatureServiceConsumerDependencies;
  depdendencies?: FeatureServiceConsumerDependencies;
  featureAppName?: string;
}
