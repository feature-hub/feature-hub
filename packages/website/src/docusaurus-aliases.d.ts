declare module '@theme/Layout' {
  export interface Props {
    readonly description?: string;
    readonly noFooter?: boolean;
    readonly title?: string;
    readonly wrapperClassName?: string;
  }
}
