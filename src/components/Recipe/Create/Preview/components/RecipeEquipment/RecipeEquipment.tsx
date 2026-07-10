import { Badge, Box, Group, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';
import type { RecipeEquipmentProps } from './types';

const RecipeEquipment = ({ equipment }: RecipeEquipmentProps) => {
  const translate = useTranslations('recipePreview');

  if (equipment.length === 0) {
    return null;
  }

  return (
    <Box mb="md">
      <Text size="sm" fw={600} mb="xs" c="dimmed" tt="uppercase">
        {translate('equipment.label')}
      </Text>

      <Group gap="xs">
        {equipment.map((item) => (
          <Badge key={item} variant="outline" color="gray" size="sm">
            {item}
          </Badge>
        ))}
      </Group>
    </Box>
  );
};
export default RecipeEquipment;
