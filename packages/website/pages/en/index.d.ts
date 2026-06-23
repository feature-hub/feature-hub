import * as React from 'react';

export interface SiteConfig {
  readonly baseUrl: string;
  readonly docsUrl: string;
  readonly tagline: string;
  readonly title: string;
}

export interface SplashContainerProps {
  readonly children: React.ReactNode;
}

export interface ProjectTitleProps {
  readonly config: SiteConfig;
}

export interface PromoSectionProps {
  readonly children: React.ReactNode;
}

export interface ButtonProps {
  readonly children: React.ReactNode;
  readonly href: string;
  readonly target?: string;
}

export interface HomeSplashProps {
  readonly config: SiteConfig;
  readonly language: string;
}

export interface IndexProps {
  readonly config: SiteConfig;
  readonly language?: string;
}
