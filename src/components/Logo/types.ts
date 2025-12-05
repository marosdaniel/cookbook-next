export interface LogoProps {
  /** Variant determines the default size */
  variant?: 'default' | 'icon';
  /** Custom width (overrides variant default) */
  width?: number;
  /** Custom height (overrides variant default) */
  height?: number;
  /** Additional CSS classes */
  className?: string;
  /** Image loading priority */
  priority?: boolean;
}
