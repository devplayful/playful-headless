import { homeHeroLcpHref } from '@/components/HomeHeroArt';
import { canonicalForPath } from '@/utils/canonical';
import { WEBSITE_JSON_LD } from '@/utils/organization-schema.mjs';
import { HomePageContent } from '../HomePageContent';

const HOME_CANONICAL = canonicalForPath('/');

type HomeDocumentFrameProps = {
  children: React.ReactNode;
  pageContentProps?: Omit<React.ComponentProps<typeof HomePageContent>, 'children'>;
};

export function HomeDocumentFrame({ children, pageContentProps }: HomeDocumentFrameProps) {
  return (
    <>
      <link rel="canonical" href={HOME_CANONICAL} />
      <meta property="og:url" content={HOME_CANONICAL} />
      <link rel="preload" as="image" href={homeHeroLcpHref()} fetchPriority="high" />
      <script
        id="playful-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: WEBSITE_JSON_LD }}
      />
      <h1 className="sr-only">
        ¿Tu e-commerce está perdiendo dinero sin que lo sepas?{' '}
      </h1>
      <HomePageContent {...pageContentProps}>{children}</HomePageContent>
    </>
  );
}
