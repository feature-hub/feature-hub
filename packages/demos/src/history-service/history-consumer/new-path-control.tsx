import {Button, ControlGroup, InputGroup} from '@blueprintjs/core';
import {History} from 'history';
import * as React from 'react';

export interface NewPathControlProps {
  readonly history: History;
  readonly specifier: string;
  readonly vertical?: boolean;
}

export function NewPathControl({
  history,
  specifier,
  vertical,
}: NewPathControlProps): JSX.Element {
  const inputElement = React.useRef<HTMLInputElement | null>(null);

  const changePath = (method: 'push' | 'replace') => {
    if (!inputElement.current) {
      return;
    }

    history[method](inputElement.current.value);
    inputElement.current.value = '';
  };

  return (
    <ControlGroup vertical={vertical}>
      <InputGroup
        id={`new-path-${specifier}`}
        placeholder="Enter a new path..."
        inputRef={(ref) => (inputElement.current = ref)}
      />
      <Button
        id={`push-${specifier}`}
        text="Push"
        onClick={() => changePath('push')}
      />
      <Button
        id={`replace-${specifier}`}
        text="Replace"
        onClick={() => changePath('replace')}
      />
    </ControlGroup>
  );
}
