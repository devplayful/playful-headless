import type { Metadata } from 'next';
import LeadThankYou from './LeadThankYou';
import ScheduleConfirmation from './ScheduleConfirmation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gracias — siguiente paso | Playful Agency',
  robots: { index: false, follow: false },
  alternates: { canonical: '/gracias' },
};

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const conv = firstQueryValue(params.conv);

  if (conv === 'Schedule') {
    return <ScheduleConfirmation />;
  }

  return <LeadThankYou />;
}
