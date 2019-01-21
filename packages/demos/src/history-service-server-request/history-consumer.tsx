import {Card, H5, InputGroup, Label} from '@blueprintjs/core';
import {History} from 'history';
import * as React from 'react';

interface HistoryConsumerProps {
  readonly history: History;
  readonly idSpecifier: string;
}

export function HistoryConsumer({
  history,
  idSpecifier
}: HistoryConsumerProps): React.ReactNode {
  return (
    <Card style={{margin: '20px'}}>
      <H5>History Consumer {idSpecifier.toUpperCase()}</H5>

      <Label>
        Pathname
        <InputGroup
          id={`pathname-${idSpecifier}`}
          value={history.location.pathname}
          disabled
        />
      </Label>
    </Card>
  );
}
