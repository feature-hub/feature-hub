import * as React from 'react';

export const Monowidth = (props: {children?: React.ReactNode}) => (
  <pre style={{display: 'inline'}}>{props.children}</pre>
);
