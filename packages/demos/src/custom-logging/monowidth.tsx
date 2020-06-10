import * as React from 'react';

export const Monowidth: React.FunctionComponent = ({children}) => (
  <pre style={{display: 'inline'}}>{children}</pre>
);
