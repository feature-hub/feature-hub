import {Button, ControlGroup, InputGroup} from '@blueprintjs/core';
import * as React from 'react';
import {NavigateOptions, useNavigate} from 'react-router';

export interface NewPathControlProps {
  readonly specifier: string;
  readonly vertical?: boolean;
}

export function NewPathControl({
  specifier,
  vertical,
}: NewPathControlProps): JSX.Element {
  const inputElement = React.useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const changePath = (options?: NavigateOptions) => {
    if (!inputElement.current) {
      return;
    }

    navigate(inputElement.current.value, options);
    inputElement.current.value = '';
  };

  return (
    <ControlGroup vertical={vertical}>
      <InputGroup
        id={`new-path-input-${specifier}`}
        placeholder="Enter a new path..."
        inputRef={(ref) => (inputElement.current = ref)}
      />
      <Button
        id={`push-button-${specifier}`}
        text="Push"
        onClick={() => changePath()}
      />
      <Button
        id={`replace-button-${specifier}`}
        text="Replace"
        onClick={() => changePath({replace: true})}
      />
    </ControlGroup>
  );
}
