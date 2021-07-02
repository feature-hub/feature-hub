import {Card, Text} from '@blueprintjs/core';
import * as React from 'react';

export interface HelloWorldProps {
  readonly subject: string;
}

export function HelloWorld({subject}: HelloWorldProps): JSX.Element {
  return (
    <Card style={{margin: '20px'}}>
      <Text>{React.useMemo(() => `Hello, ${subject}!`, [subject])}</Text>
    </Card>
  );
}
