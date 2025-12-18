import type { Route } from 'next';

export interface NavbarLinksGroupProps {
  readonly icon?: React.ElementType;
  readonly label: React.ReactNode;
  readonly initiallyOpened?: boolean;
  readonly link?: Route;
  readonly links?: { readonly label: string; readonly link: Route }[];
}
