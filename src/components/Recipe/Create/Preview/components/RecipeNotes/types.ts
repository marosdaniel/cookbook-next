export type RecipeNotesProps = {
  tips?: string | null;
  substitutions?: string | null;
};

export type RecipeNoteProps = {
  title: string;
  content: string;
  mt: 'md' | 'xl';
};
