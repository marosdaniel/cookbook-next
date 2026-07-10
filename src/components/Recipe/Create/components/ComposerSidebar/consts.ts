import {
  IconChefHat,
  IconPhoto,
  IconSparkles,
  IconToolsKitchen2,
  type TablerIcon,
} from '@tabler/icons-react';
import type { ComposerSection } from '../../types';

export const SECTION_ITEMS: Array<{
  key: ComposerSection;
  labelKey: 'basics' | 'media' | 'ingredients' | 'steps';
  Icon: TablerIcon;
}> = [
  { key: 'basics', labelKey: 'basics', Icon: IconSparkles },
  { key: 'media', labelKey: 'media', Icon: IconPhoto },
  { key: 'ingredients', labelKey: 'ingredients', Icon: IconToolsKitchen2 },
  { key: 'steps', labelKey: 'steps', Icon: IconChefHat },
];
