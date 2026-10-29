import Link from 'next/link';

export default function HomeB2BCasosSection({ className }: { className?: string }) {
  return (
    <section data-cta-section="casos-home" className={className}>
      <div className="playful-contenedor playful-contenedor-FFEFD1">
        <h2 className="playful-h2 max-w-3xl mx-auto">
          Casos de e-commerce: Jumex, Odwalla y SoyTechno
        </h2>
        <div className="max-w-3xl mx-auto text-left space-y-6 mt-8">
          <p className="playful-contenido-p">
            Son tres marcas de consumo con catálogos y mercados distintos. Jumex y Odwalla
            necesitaban su canal de venta directa al consumidor en Shopify, y SoyTechno necesitaba
            que en Venezuela se comprara online pagando en bolívares, en divisas o a cuotas.
          </p>
          <h3 className="playful-h3">¿El canal de tu marca tiene un reto parecido?</h3>
          <p className="playful-contenido-p">
            SoyTechno, e-commerce en Venezuela. Checkout en bolívares y divisas desde una sola
            pantalla, la primera integración nativa de Cashea en una tienda online venezolana para
            pagar a cuotas y el rastreo de MRW en tiempo real. SoyTechno cerró 2025 con 12.722
            ventas, un 65 % más que en 2024.
          </p>
          <p>
            <Link href="/casos-de-exito/soytechno-ecommerce-venezuela" className="playful-boton !inline-block">
              Ver el caso SoyTechno
            </Link>
          </p>
          <p className="playful-contenido-p">
            Jumex, Shopify y diseño de experiencia de usuario. Jumex necesitaba llevar su portafolio
            de jugos, néctares y bebidas a un canal de venta directa. Su tienda en Shopify ordena el
            catálogo por colecciones, categorías y variantes, con fichas de producto pensadas para
            móvil y escritorio.
          </p>
          <p>
            <Link href="/casos-de-exito/jumex-shopify-dtc-ecommerce" className="playful-boton !inline-block">
              Ver el caso Jumex
            </Link>
          </p>
          <p className="playful-contenido-p">
            Odwalla, Shopify y diseño de experiencia de usuario. Odwalla dependía de marketplaces
            como Amazon y perdía la relación directa con su comprador. Su tienda en Shopify reúne
            colecciones, variantes y fichas con la información nutricional de cada producto.
          </p>
          <p>
            <Link href="/casos-de-exito/odwalla-shopify-dtc-ecommerce" className="playful-boton !inline-block">
              Ver el caso Odwalla
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
