import {Card, Classes, Label} from '@blueprintjs/core';
import {FeatureAppDefinition} from '@feature-hub/core';
import {History, HistoryServiceV1} from '@feature-hub/history-service';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';

interface HistoryConsumerProps {
  readonly history: History;
  readonly idSpecifier: string;
}

interface HistoryConsumerState {
  readonly pathname: string;
}

class HistoryConsumer extends React.Component<
  HistoryConsumerProps,
  HistoryConsumerState
> {
  public readonly state = {pathname: this.props.history.location.pathname};

  private unlisten?: () => void;

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
    const {idSpecifier} = this.props;
    const {pathname} = this.state;

    return (
      <Card>
        <Label className="bp3-inline">
          Pathname
          <input
            id={`pathname-${idSpecifier}`}
            className={Classes.INPUT}
            value={pathname}
            disabled
          />
        </Label>
      </Card>
    );
  }
}

export const historyConsumerDefinition: FeatureAppDefinition<
  ReactFeatureApp,
  undefined,
  {'s2:history': HistoryServiceV1}
> = {
  id: 'test:history-consumer',

  dependencies: {
    's2:history': '^1.0'
  },

  create: env => {
    const {featureServices, idSpecifier} = env;
    const historyService = featureServices['s2:history'];

    return {
      render: () => (
        <HistoryConsumer
          history={historyService.createBrowserHistory()}
          idSpecifier={idSpecifier || ''}
        />
      )
    };
  }
};

export default historyConsumerDefinition;
