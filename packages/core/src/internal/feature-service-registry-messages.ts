export function featureServiceUnsupported(
  optional: boolean,
  providerId: string,
  consumerUid: string,
  versionRange: string,
  supportedVersions: string[]
): string {
  return `The ${
    optional ? 'optional' : 'required'
  } Feature Service ${JSON.stringify(
    providerId
  )} in the unsupported version range ${JSON.stringify(
    versionRange
  )} could not be bound to consumer ${JSON.stringify(
    consumerUid
  )}. The supported versions are ${JSON.stringify(supportedVersions)}.`;
}

export function featureServiceVersionInvalid(
  providerId: string,
  consumerId: string,
  version: string
): string | undefined {
  return `The Feature Service ${JSON.stringify(
    providerId
  )} could not be registered by consumer ${JSON.stringify(
    consumerId
  )} because it defines the invalid version ${JSON.stringify(version)}.`;
}

export function featureServiceDependencyVersionInvalid(
  optional: boolean,
  providerId: string,
  consumerUid: string
): string {
  return `The ${
    optional ? 'optional' : 'required'
  } Feature Service ${JSON.stringify(
    providerId
  )} in an invalid version could not be bound to consumer ${JSON.stringify(
    consumerUid
  )}.`;
}

export function featureServiceNotRegistered(
  optional: boolean,
  providerId: string,
  consumerUid: string
): string {
  return `The ${
    optional ? 'optional' : 'required'
  } Feature Service ${JSON.stringify(
    providerId
  )} is not registered and therefore could not be bound to consumer ${JSON.stringify(
    consumerUid
  )}.`;
}

export function featureServiceSuccessfullyRegistered(
  providerId: string,
  consumerId: string
): string {
  return `The Feature Service ${JSON.stringify(
    providerId
  )} has been successfully registered by consumer ${JSON.stringify(
    consumerId
  )}.`;
}

export function featureServiceAlreadyRegistered(
  providerId: string,
  consumerId: string
): string {
  return `The already registered Feature Service ${JSON.stringify(
    providerId
  )} could not be re-registered by consumer ${JSON.stringify(consumerId)}.`;
}

export function featureServiceSuccessfullyBound(
  providerId: string,
  consumerUid: string
): string {
  return `The required Feature Service ${JSON.stringify(
    providerId
  )} has been successfully bound to consumer ${JSON.stringify(consumerUid)}.`;
}

export function featureServicesAlreadyBound(
  consumerUid: string
): string | undefined {
  return `All required Feature Services are already bound to consumer ${JSON.stringify(
    consumerUid
  )}.`;
}

export function featureServiceCouldNotBeUnbound(
  providerId: string,
  consumerUid: string
): string {
  return `The required Feature Service ${JSON.stringify(
    providerId
  )} could not be unbound from consumer ${JSON.stringify(consumerUid)}.`;
}

export function featureServiceSuccessfullyUnbound(
  providerId: string,
  consumerUid: string
): string {
  return `The required Feature Service ${JSON.stringify(
    providerId
  )} has been successfully unbound from consumer ${JSON.stringify(
    consumerUid
  )}.`;
}

export function featureServicesAlreadyUnbound(consumerUid: string): string {
  return `All required Feature Services are already unbound from consumer ${JSON.stringify(
    consumerUid
  )}.`;
}
