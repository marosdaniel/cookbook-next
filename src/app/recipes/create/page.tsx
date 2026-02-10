'use client';

import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { RecipeComposer } from '@/components/Recipe/Create/RecipeComposer';

export default function NewRecipePage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/api/auth/signin');
    }
  }, [status]);

  if (status === 'loading') return null;
  if (!session) return null;

  return <RecipeComposer />;
}
