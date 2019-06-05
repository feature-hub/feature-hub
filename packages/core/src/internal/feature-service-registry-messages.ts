export function featureServiceUnsupported(
  optional: boolean,
  providerId: string,
  consumerId: string,
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
    consumerId
  )}. The supported versions are ${JSON.stringify(supportedVersions)}.`;
}

export function featureServiceVersionInvalid(
  providerId: string,
  registrantId: string,
  version: string
): string | undefined {
  return `The Feature Service ${JSON.stringify(
    providerId
  )} could not be registered by registrant ${JSON.stringify(
    registrantId
  )} because it defines the invalid version ${JSON.stringify(version)}.`;
}

export function featureServiceDependencyVersionInvalid(
  optional: boolean,
  providerId: string,
  consumerId: string
): string {
  return `The ${
    optional ? 'optional' : 'required'
  } Feature Service ${JSON.stringify(
    providerId
  )} in an invalid version could not be bound to consumer ${JSON.stringify(
    consumerId
  )}.`;
}

export function featureServiceNotRegistered(
  optional: boolean,
  providerId: string,
  consumerId: string
): string {
  return `The ${
    optional ? 'optional' : 'required'
  } Feature Service ${JSON.stringify(
    providerId
  )} is not registered and therefore could not be bound to consumer ${JSON.stringify(
    consumerId
  )}.`;
}

export function featureServiceSuccessfullyRegistered(
  providerId: string,
  registrantId: string
): string {
  return `The Feature Service ${JSON.stringify(
    providerId
  )} has been successfully registered by registrant ${JSON.stringify(
    registrantId
  )}.`;
}

export function featureServiceAlreadyRegistered(
  providerId: string,
  registrantId: string
): string {
  return `The already registered Feature Service ${JSON.stringify(
    providerId
  )} could not be re-registered by registrant ${JSON.stringify(registrantId)}.`;
}

export function featureServiceSuccessfullyBound(
  providerId: string,
  consumerId: string
): string {
  return `The required Feature Service ${JSON.stringify(
    providerId
  )} has been successfully bound to consumer ${JSON.stringify(consumerId)}.`;
}

export function featureServicesAlreadyBound(
  consumerId: string
): string | undefined {
  return `All required Feature Services are already bound to consumer ${JSON.stringify(
    consumerId
  )}.`;
}

export function featureServiceCouldNotBeUnbound(
  providerId: string,
  consumerId: string
): string {
  return `The required Feature Service ${JSON.stringify(
    providerId
  )} could not be unbound from consumer ${JSON.stringify(consumerId)}.`;
}

export function featureServiceSuccessfullyUnbound(
  providerId: string,
  consumerId: string
): string {
  return `The required Feature Service ${JSON.stringify(
    providerId
  )} has been successfully unbound from consumer ${JSON.stringify(
    consumerId
  )}.`;
}

export function featureServicesAlreadyUnbound(consumerId: string): string {
  return `All required Feature Services are already unbound from consumer ${JSON.stringify(
    consumerId
  )}.`;
}
