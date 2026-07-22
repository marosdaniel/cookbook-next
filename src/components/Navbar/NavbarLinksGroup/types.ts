import type { Route } from 'next';
import type { ElementType, ReactNode } from 'react';

export interface NavbarLinksGroupProps {
  readonly icon?: ElementType;
  readonly label: ReactNode;
  readonly initiallyOpened?: boolean;
  readonly link?: Route;
  readonly links?: { readonly label: string; readonly link: Route }[];
}
