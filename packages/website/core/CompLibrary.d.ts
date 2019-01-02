export interface ContainerProps {
  readonly padding?: ('all' | 'bottom' | 'left' | 'right' | 'top')[];
  readonly background?: 'dark' | 'highlight' | 'light';
}

export interface Content {
  readonly title?: string;
  readonly content?: string;
  readonly image?: string;
  readonly imageAlt?: string;
  readonly imageAlign?: 'top' | 'left' | 'bottom' | 'right';
  readonly imageLink?: string;
}

export interface GridBlockProps {
  readonly align?: 'left' | 'center' | 'right';
  readonly layout?: 'twoColumn' | 'threeColumn' | 'fourColumn';
  readonly contents?: Content[];
}

export declare const MarkdownBlock: React.ComponentClass;
export declare const Container: React.ComponentClass<ContainerProps>;
export declare const GridBlock: React.ComponentClass<GridBlockProps>;
