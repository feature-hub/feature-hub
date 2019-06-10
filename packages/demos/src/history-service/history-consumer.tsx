import {
  Button,
  Card,
  ControlGroup,
  H5,
  InputGroup,
  Label
} from '@blueprintjs/core';
import {History} from 'history';
import * as React from 'react';
import Media from 'react-media';

interface HistoryConsumerProps {
  readonly history: History;
  readonly consumerId: string;
}

interface HistoryConsumerState {
  readonly pathname: string;
}

export class HistoryConsumer extends React.Component<
  HistoryConsumerProps,
  HistoryConsumerState
> {
  public readonly state = {pathname: this.props.history.location.pathname};

  private unlisten?: () => void;
  private inputElement: HTMLInputElement | null = null;

  public componentDidMount(): void {
    const {history} = this.props;

    this.unlisten = history.listen(({pathname}) => this.setState({pathname}));
  }

  public componentWillUnmount(): void {
    if (this.unlisten) {
      this.unlisten();
    }
  }

  public render(): React.ReactNode {
    const {consumerId} = this.props;
    const idSpecifier = consumerId.slice(consumerId.length - 1);
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

        <Media query="(max-width: 370px)">
          {matches => (
            <ControlGroup vertical={matches}>
              <InputGroup
                id={`new-pathname-${idSpecifier}`}
                placeholder="Enter a new path..."
                inputRef={ref => (this.inputElement = ref)}
              />
              <Button
                id={`push-${idSpecifier}`}
                text="Push"
                onClick={() => this.changePath('push')}
              />
              <Button
                id={`replace-${idSpecifier}`}
                text="Replace"
                onClick={() => this.changePath('replace')}
              />
            </ControlGroup>
          )}
        </Media>
      </Card>
    );
  }

  private changePath(method: 'push' | 'replace'): void {
    if (!this.inputElement) {
      return;
    }

    this.props.history[method](this.inputElement.value);
    this.inputElement.value = '';
  }
}
