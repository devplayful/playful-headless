import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import { twitterFromOpenGraph } from '@/utils/page-seo-overrides.mjs';
import { getAllCaseStudies } from '@/services/wordpress';
import ContactPageClient from '@/app/contactar-agencia-de-marketing-digital/ContactPageClient';


const CONTACT_URL = canonicalForPath('/contactar-agencia-de-marketing-digital');

const CONTACT_TITLE = 'Contactar agencia ecommerce | Playful Agency';
const CONTACT_DESCRIPTION = 'Formulario para contactar a Playful, agencia de ecommerce. Cuéntanos tu tienda y el caso. Hablamos de tu próximo proyecto, no de una primera venta.';

export const metadata: Metadata = {
  title: CONTACT_TITLE,
  description: CONTACT_DESCRIPTION,
  alternates: { canonical: CONTACT_URL },
  openGraph: {
    title: CONTACT_TITLE,
    description: CONTACT_DESCRIPTION,
    url: CONTACT_URL,
  },
  twitter: twitterFromOpenGraph(CONTACT_TITLE, CONTACT_DESCRIPTION),
};

export default async function ContactPage() {
  // Obtener casos de éxito una sola vez en el servidor
  const casosDeExito = await getAllCaseStudies();
  const previewSimulation = process.env.VERCEL_ENV === 'preview'
    && process.env.PREVIEW_CONTACT_SIMULATOR_ENABLED === 'true';

  return <ContactPageClient
    casosDeExito={casosDeExito}
    previewSimulation={previewSimulation}
  />;
}
