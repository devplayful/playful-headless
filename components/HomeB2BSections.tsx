import Link from 'next/link';
import { SERVICE_BOOKING_HREF } from '@/utils/booking';
import { HOME_PASARELA_VE_HREF } from '@/lib/home-copy';

const shellInner = 'playful-contenedor max-w-3xl mx-auto text-left space-y-6';

export default function HomeB2BSections({ className }: { className?: string }) {
  return (
    <>
      <section data-cta-section="canal-frenos" className={className}>
        <div className="playful-contenedor playful-contenedor-FFEFD1">
          <h2 className="playful-h2 max-w-3xl mx-auto">
            Por qué el canal online de una marca no avanza al ritmo que necesita su equipo
          </h2>
          <div className={`${shellInner} mt-8`}>
            <p className="playful-contenido-p">
              En las reuniones con equipos de marketing y de e-commerce se repiten casi siempre los
              mismos frenos, que son un lanzamiento que se aplaza, una operación que depende del
              proveedor y unas ventas y un stock que hay que cuadrar a mano.
            </p>
            <h3 className="playful-h3">El lanzamiento del canal se ha intentado más de una vez</h3>
            <p className="playful-contenido-p">
              Hay empresas que llevan dos o tres intentos de lanzar su tienda online y ninguno ha
              llegado a publicarse, a veces porque se esperaba que lo resolviera la casa matriz, el
              fabricante u otra de las partes implicadas.
            </p>
            <p className="playful-contenido-p">
              Cada intento vuelve a empezar con otro proveedor o con otra plataforma, el equipo no
              tiene una fecha de salida con la que planificar y el canal propio sigue sin existir.
            </p>
            <h3 className="playful-h3">La operación diaria depende del proveedor</h3>
            <p className="playful-contenido-p">
              Si subir un producto, cambiar un precio o revisar un pedido exige escribir al
              proveedor, el equipo que opera la tienda cada día tiene que esperar a otra persona
              para hacer su trabajo.
            </p>
            <p className="playful-contenido-p">
              Lo que piden los equipos casi siempre es una plataforma robusta y, sobre todo, fácil
              de administrar.
            </p>
            <h3 className="playful-h3">
              Los pagos, la facturación y el inventario van cada uno por su lado
            </h3>
            <p className="playful-contenido-p">
              Cuando el cobro está en la tienda y la factura y el inventario viven en otro sistema,
              como el ERP (el programa de gestión de la empresa), cada pedido se cuadra a mano y las
              ventas y el stock no coinciden de un sistema a otro, así que medir el canal exige
              cruzar datos antes de poder leerlos.
            </p>
            <p className="playful-contenido-p">
              Y si la marca vende en Venezuela, que pueda cobrar con pagos locales automáticos
              depende de la plataforma que se elija.
            </p>
            <p className="text-center pt-4">
              <Link href={SERVICE_BOOKING_HREF} className="playful-boton">
                Reservar reunión para revisar tu canal
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section data-cta-section="como-trabajamos" className={`${className} pb-[1rem]`}>
        <div className="playful-contenedor playful-contenedor-B3FFF3">
          <h2 className="playful-h2 max-w-3xl mx-auto">
            Cómo trabajamos la tienda online de tu marca, de la primera reunión a la entrega
          </h2>
          <div className={`${shellInner} mt-8`}>
            <p className="playful-contenido-p">
              Cada proyecto pasa por las mismas tres fases, y en cada una tu equipo sabe qué
              recibe, qué tiene que aprobar y en qué momento.
            </p>
            <h3 className="playful-h3">Diseño con dos propuestas visuales</h3>
            <p className="playful-contenido-p">
              Antes de desarrollar nada, presentamos a tu equipo dos propuestas visuales de la
              tienda.
            </p>
            <p className="playful-contenido-p">
              Tu equipo elige sobre ellas y a partir de esa elección se construye, así que el
              diseño queda aprobado antes de que empiece el desarrollo y nadie se encuentra al final
              con algo que no esperaba.
            </p>
            <h3 className="playful-h3">
              Desarrollo e integraciones en la plataforma que encaja con tu operación
            </h3>
            <p className="playful-contenido-p">
              Somos{' '}
              <Link href="/agencia-shopify">agencia Shopify</Link> y trabajamos también en
              WooCommerce, Medusa (una plataforma de código abierto para tiendas a medida) y apps
              móviles. La plataforma se elige a partir de tus integraciones, tu catálogo y la forma
              en que cobras. El proceso completo está en nuestra página de{' '}
              <Link href="/agencia-e-commerce">agencia de e-commerce</Link>.
            </p>
            <p className="playful-contenido-p">
              La conexión con el sistema donde facturas y llevas el inventario es una fase del
              proyecto con su propio entregable, para que la tienda y la operación trabajen con los
              mismos datos de pedidos, facturas y stock.
            </p>
            <p className="playful-contenido-p">
              Los cobros automáticos de la{' '}
              <Link href={HOME_PASARELA_VE_HREF}>
                pasarela de pagos en Venezuela
              </Link>
              , como Instapago, los instalamos en WooCommerce, en apps móviles y en Medusa, así que
              si tu marca vende en Venezuela la plataforma se elige teniendo eso en cuenta.
            </p>
            <p className="playful-contenido-p">
              Si migras, antes de mover nada hacemos la lista de las direcciones (URL) que Google
              ya conoce y del catálogo que tus clientes ya navegan, para que el canal conserve el
              posicionamiento que trae.
            </p>
            <h3 className="playful-h3">Entrega a tiempo con 30 días de garantía</h3>
            <p className="playful-contenido-p">
              Publicamos la tienda en el plazo acordado y la dejamos lista para que tu equipo la
              opere sin depender de nosotros para lo básico.
            </p>
            <p className="playful-contenido-p">
              Durante los 30 días siguientes a la entrega, la garantía cubre cualquier error que
              aparezca.
            </p>
            <p className="text-center pt-4">
              <Link href={SERVICE_BOOKING_HREF} className="playful-boton">
                Reservar reunión de 30 a 40 minutos
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
