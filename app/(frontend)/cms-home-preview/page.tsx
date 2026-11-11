import { notFound } from 'next/navigation';
import { resolveHomeContentForPayloadRender } from '@/lib/cms-home';
import { homePayloadPreviewAttrs } from '@/lib/cms-home-flag';
import { HomePayloadBody } from '@/components/home/HomePayloadBody';
import { HomeDocumentFrame } from '../home/HomeDocumentFrame';
import { generateMetadata as homeGenerateMetadata } from '../page';

export async function generateMetadata() {
  if (process.env.VERCEL_ENV !== 'preview') {
    notFound();
  }
  return homeGenerateMetadata();
}

export default async function CmsHomePreviewPage() {
  if (process.env.VERCEL_ENV !== 'preview') {
    notFound();
  }
  const content = await resolveHomeContentForPayloadRender();
  return (
    <HomeDocumentFrame pageContentProps={homePayloadPreviewAttrs()}>
      <HomePayloadBody content={content} />
    </HomeDocumentFrame>
  );
}
