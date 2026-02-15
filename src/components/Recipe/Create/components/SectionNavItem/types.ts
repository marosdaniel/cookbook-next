export interface SectionNavItemProps {
  label: string;
  hint: string;
  icon: React.ReactNode;
  active: boolean;
  completionDone: number;
  completionTotal: number;
  onClick: () => void;
}
