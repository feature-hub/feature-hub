import {Card, H5, InputGroup, Label} from '@blueprintjs/core';
import {History} from 'history';
import * as React from 'react';

interface HistoryConsumerProps {
  readonly history: History;
  readonly idSpecifier: string;
}

interface HistoryConsumerState {
  readonly pathname: string;
}

export class HistoryConsumer extends React.Component<
  HistoryConsumerProps,
  HistoryConsumerState
> {
  public readonly state = {pathname: this.props.history.location.pathname};

  public render(): React.ReactNode {
    const {idSpecifier} = this.props;
    const {pathname} = this.state;

    return (
      <Card style={{margin: '20px'}}>
        <H5>History Consumer {idSpecifier.toUpperCase()}</H5>

        <Label>
          Pathname
          <InputGroup
            id={`pathname-${idSpecifier}`}
            value={pathname}
            disabled
          />
        </Label>
      </Card>
    );
  }
}
