import {InputGroup, Label} from '@blueprintjs/core';
import * as React from 'react';

export interface PathnameLabelProps {
  readonly specifier: string;
  readonly pathname: string;
}

export function PathnameLabel({
  specifier,
  pathname,
}: PathnameLabelProps): JSX.Element {
  return (
    <Label>
      Pathname
      <InputGroup
        id={`pathname-input-${specifier}`}
        value={pathname}
        disabled
      />
    </Label>
  );
}
