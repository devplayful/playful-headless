import type { Metadata } from 'next';
import CopyFirma from './CopyFirma';
import { FIRMA_ALEJANDRA_HTML } from './firma-html';

export const metadata: Metadata = {
  title: 'Firma de Gmail · Alejandra Da Costa',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function FirmaAlejandraPage() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px 48px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#2A0064' }}>
      <h1 style={{ fontSize: 22, margin: '0 0 16px' }}>Tu firma de Gmail</h1>
      <CopyFirma html={FIRMA_ALEJANDRA_HTML} />
      <ol style={{ fontSize: 15, lineHeight: '22px', paddingLeft: 20, marginTop: 24 }}>
        <li>Pulsa «Copiar firma».</li>
        <li>En Gmail: Configuración (rueda) → Ver todos los ajustes → Firma → Crear.</li>
        <li>Pega la firma en el recuadro y pulsa «Guardar cambios» al final de la página.</li>
      </ol>
    </main>
  );
}
