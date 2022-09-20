import {Card, H5} from '@blueprintjs/core';
import * as React from 'react';
import Media from 'react-media';
import {useLocation} from 'react-router';
import {Link} from 'react-router-dom';
import {NewPathControl} from './new-path-control';
import {PathnameLabel} from './pathname-label';

interface HistoryConsumerProps {
  readonly historyKey: string;
}

export function HistoryConsumer({
  historyKey,
}: HistoryConsumerProps): JSX.Element {
  const specifier = historyKey.slice(historyKey.length - 1);
  const location = useLocation();

  return (
    <Card style={{margin: '20px'}}>
      <H5>History Consumer {specifier.toUpperCase()}</H5>

      <PathnameLabel specifier={specifier} pathname={location.pathname} />

      <p>
        <Link to="/foo" id={`push-link-${specifier}`}>
          Push /foo
        </Link>
      </p>
      <p>
        <Link to="/bar" id={`replace-link-${specifier}`} replace>
          Replace /bar
        </Link>
      </p>

      <Media query="(max-width: 370px)">
        {(matches) => (
          <NewPathControl specifier={specifier} vertical={matches} />
        )}
      </Media>
    </Card>
  );
}
