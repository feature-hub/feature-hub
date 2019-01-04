export interface ConsumerPaths {
  readonly [consumerUid: string]: string;
}

function encodeConsumerPaths(consumerPaths: ConsumerPaths): string {
  return JSON.stringify(consumerPaths);
}

function decodeConsumerPaths(encodedConsumerPaths: string): ConsumerPaths {
  return JSON.parse(encodedConsumerPaths);
}

export function addConsumerPath(
  encodedConsumerPaths: string | null,
  consumerUid: string,
  path: string
): string {
  return encodeConsumerPaths({
    ...decodeConsumerPaths(encodedConsumerPaths || '{}'),
    [consumerUid]: path
  });
}

export function removeConsumerPath(
  encodedConsumerPaths: string | null,
  consumerUid: string
): string | undefined {
  if (!encodedConsumerPaths) {
    return undefined;
  }

  /* istanbul ignore next */
  const {[consumerUid]: _removed, ...rest} = decodeConsumerPaths(
    encodedConsumerPaths
  );

  if (Object.keys(rest).length === 0) {
    return undefined;
  }

  return encodeConsumerPaths(rest);
}

export function getConsumerPath(
  encodedConsumerPaths: string,
  consumerUid: string
): string {
  return decodeConsumerPaths(encodedConsumerPaths)[consumerUid];
}
