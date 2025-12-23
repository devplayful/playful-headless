import { getAllCaseStudies } from '@/services/wordpress';
import ContactPageClient from '@/app/contactar-agencia-de-marketing-digital/ContactPageClient';

export default async function ContactPage() {
  // Obtener casos de éxito una sola vez en el servidor
  const casosDeExito = await getAllCaseStudies();
  
  return <ContactPageClient casosDeExito={casosDeExito} />;
}
