import type { ProfileUser } from '../types';

export interface InfoFieldProps {
  label: string;
  value: string;
  isLoading?: boolean;
}

export interface PersonalDataProps {
  user: ProfileUser | undefined;
  loading: boolean;
  refetch: () => Promise<unknown>;
}
