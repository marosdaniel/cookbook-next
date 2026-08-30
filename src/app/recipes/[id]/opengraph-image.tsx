import { ImageResponse } from 'next/og';
import { RecipeService } from '@/lib/services/RecipeService';

export const alt = 'Cookbook recipe';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ id: string }>;
}

type RecipeOgFields = {
  title: string;
  cookingTime: number;
  category?: { label: string } | null;
  difficultyLevel?: { label: string } | null;
};

const MAX_TITLE_LENGTH = 90;

const Badge = ({ children }: { children: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '10px 20px',
      borderRadius: 999,
      background: 'rgba(224, 8, 144, 0.1)',
      color: '#AD1374',
      fontSize: 26,
      fontWeight: 600,
    }}
  >
    {children}
  </div>
);

export default async function Image({ params }: Props) {
  const { id } = await params;

  let recipe: RecipeOgFields | null = null;
  try {
    recipe = (await RecipeService.getRecipeBySlugOrId(id)) as RecipeOgFields;
  } catch {
    recipe = null;
  }

  const title = (recipe?.title ?? 'Cookbook').slice(0, MAX_TITLE_LENGTH);
  const category = recipe?.category?.label;
  const difficulty = recipe?.difficultyLevel?.label;
  const cookingTime = recipe?.cookingTime;

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        background: 'linear-gradient(135deg, #FFEBF5 0%, #F5EDFF 100%)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 18,
            background: '#E00890',
            color: 'white',
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          C
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 36,
            fontWeight: 700,
            color: '#26262B',
          }}
        >
          Cookbook
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 700,
            color: '#26262B',
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {category && <Badge>{category}</Badge>}
          {difficulty && <Badge>{difficulty}</Badge>}
          {typeof cookingTime === 'number' && (
            <Badge>{`${cookingTime} min`}</Badge>
          )}
        </div>
      </div>
    </div>,
    { ...size },
  );
}
