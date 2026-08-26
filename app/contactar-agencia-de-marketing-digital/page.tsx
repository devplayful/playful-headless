import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import { getAllCaseStudies } from '@/services/wordpress';
import ContactPageClient from '@/app/contactar-agencia-de-marketing-digital/ContactPageClient';


const CONTACT_URL = canonicalForPath('/contactar-agencia-de-marketing-digital');

export const metadata: Metadata = {
  alternates: { canonical: CONTACT_URL },
  openGraph: { url: CONTACT_URL },
};

export default async function ContactPage() {
  // Obtener casos de éxito una sola vez en el servidor
  const casosDeExito = await getAllCaseStudies();
  
  return <ContactPageClient casosDeExito={casosDeExito} />;
}
