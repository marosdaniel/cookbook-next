export interface LogoProps {
  /** Variant determines the default size */
  variant?: 'default' | 'icon';
  /** Custom width (overrides variant default) */
  width?: number;
  /** Custom height (overrides variant default) */
  height?: number;
  /** Additional CSS classes */
  className?: string;
  /** Show 'Cookbook' text next to logo */
  withText?: boolean;
  /** Hide text on mobile (only applies if withText is true) */
  hideTextOnMobile?: boolean;
  /** Image loading priority */
  priority?: boolean;
}
