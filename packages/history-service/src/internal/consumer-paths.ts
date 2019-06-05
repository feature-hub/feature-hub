export interface ConsumerPaths {
  readonly [consumerId: string]: string;
}

function encodeConsumerPaths(consumerPaths: ConsumerPaths): string {
  return JSON.stringify(consumerPaths);
}

function decodeConsumerPaths(encodedConsumerPaths: string): ConsumerPaths {
  return JSON.parse(encodedConsumerPaths);
}

export function addConsumerPath(
  encodedConsumerPaths: string | null,
  consumerId: string,
  path: string
): string {
  return encodeConsumerPaths({
    ...decodeConsumerPaths(encodedConsumerPaths || '{}'),
    [consumerId]: path
  });
}

export function removeConsumerPath(
  encodedConsumerPaths: string | null,
  consumerId: string
): string | undefined {
  if (!encodedConsumerPaths) {
    return undefined;
  }

  /* istanbul ignore next */
  const {[consumerId]: _removed, ...rest} = decodeConsumerPaths(
    encodedConsumerPaths
  );

  if (Object.keys(rest).length === 0) {
    return undefined;
  }

  return encodeConsumerPaths(rest);
}

export function getConsumerPath(
  encodedConsumerPaths: string,
  consumerId: string
): string {
  return decodeConsumerPaths(encodedConsumerPaths)[consumerId];
}
