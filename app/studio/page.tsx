import { Studio } from '@/components/Studio/Studio';
import { StudioMode } from '@/components/Studio/types';

type Props = {
  searchParams?: Promise<{ mode?: string }>;
};

export default async function StudioPage({ searchParams }: Props) {
  const params = await searchParams;
  const mode: StudioMode = params?.mode === 'play' ? 'play' : 'sing';

  return <Studio initialMode={mode} />;
}
