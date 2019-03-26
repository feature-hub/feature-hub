import * as React from 'react';

export interface TestErrorBoundaryProps {
  handleError: (error: Error) => void;
}

export interface TestErrorBoundaryState {
  readonly hasError: boolean;
}

export class TestErrorBoundary extends React.Component<
  TestErrorBoundaryProps,
  TestErrorBoundaryState
> {
  public static getDerivedStateFromError = () => ({hasError: true});

  public state = {hasError: false};

  public componentDidCatch(error: Error): void {
    this.props.handleError(error);
  }

  public render(): React.ReactNode {
    return this.state.hasError ? 'test error boundary' : this.props.children;
  }
}
