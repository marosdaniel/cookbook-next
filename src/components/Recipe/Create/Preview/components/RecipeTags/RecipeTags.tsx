import { Badge, Group } from '@mantine/core';
import type { RecipeTagsProps } from './types';

const RecipeTags = ({ tags }: RecipeTagsProps) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <Group mt={50} gap="xs">
      {tags.map((tag) => (
        <Badge key={tag} variant="dot" size="lg" color="gray" radius="sm">
          {tag}
        </Badge>
      ))}
    </Group>
  );
};

export default RecipeTags;
