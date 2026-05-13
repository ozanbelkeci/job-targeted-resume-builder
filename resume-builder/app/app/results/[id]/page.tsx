import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ResultsClient } from './ResultsClient';
import type { Optimization } from '@/types';

interface ResultsPageProps {
  params: { id: string };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const [{ data: optimization }, { data: userCredits }] = await Promise.all([
    supabase
      .from('optimizations')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single<Optimization>(),
    supabase
      .from('user_credits')
      .select('is_pro')
      .eq('user_id', user.id)
      .single(),
  ]);

  if (!optimization) {
    notFound();
  }

  // Fetch original resume text for before/after toggle
  const { data: resume } = await supabase
    .from('resumes')
    .select('original_text')
    .eq('id', optimization.resume_id)
    .single();

  const isPro = userCredits?.is_pro ?? false;
  const isFree = !isPro;
  const originalResumeText = (resume?.original_text as string | null) ?? '';

  return (
    <ResultsClient
      initialOptimization={optimization}
      isPro={isPro}
      isFree={isFree}
      originalResumeText={originalResumeText}
    />
  );
}
