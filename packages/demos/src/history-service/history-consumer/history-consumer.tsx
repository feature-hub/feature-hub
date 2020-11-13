import {Card, H5} from '@blueprintjs/core';
import * as React from 'react';
import Media from 'react-media';
import {Route} from 'react-router';
import {NewPathControl} from './new-path-control';
import {PathnameLabel} from './pathname-label';

interface HistoryConsumerProps {
  readonly historyKey: string;
}

export function HistoryConsumer({
  historyKey,
}: HistoryConsumerProps): JSX.Element {
  const specifier = historyKey.slice(historyKey.length - 1);

  return (
    <Card style={{margin: '20px'}}>
      <H5>History Consumer {specifier.toUpperCase()}</H5>

      <Route>
        {({location}) => (
          <PathnameLabel specifier={specifier} pathname={location.pathname} />
        )}
      </Route>

      <Media query="(max-width: 370px)">
        {(matches) => (
          <Route>
            {({history}) => (
              <NewPathControl
                history={history}
                specifier={specifier}
                vertical={matches}
              />
            )}
          </Route>
        )}
      </Media>
    </Card>
  );
}
