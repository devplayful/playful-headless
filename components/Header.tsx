import { getAllCaseStudies } from '@/services/wordpress';
import HeaderClient from './HeaderClient';

export default async function Header() {
  // Obtener casos de éxito para el submenú
  const casosDeExito = await getAllCaseStudies();

  return <HeaderClient caseStudies={casosDeExito} />;
}
