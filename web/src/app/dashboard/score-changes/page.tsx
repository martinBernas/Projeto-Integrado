import { redirect } from 'next/navigation';
import { notificationPage } from '@/lib/notifications';
export default async function ScoreChangesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = notificationPage((await searchParams).page);
  redirect(`/dashboard/requests${page ? `?page=${page}` : ''}`);
}