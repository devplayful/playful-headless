/**
 * 404 global (Next 15.5, experimental.globalNotFound).
 */
import type { Metadata } from 'next';
import RootLayout, { generateMetadata as layoutMetadata } from './(frontend)/layout';
import NotFound from './(frontend)/not-found';

export async function generateMetadata(): Promise<Metadata> {
  return layoutMetadata();
}

export default function GlobalNotFound() {
  return (
    <RootLayout>
      <NotFound payloadSlug="global-not-found" />
    </RootLayout>
  );
}
