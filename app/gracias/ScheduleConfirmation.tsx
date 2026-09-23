import Link from 'next/link';

export default function ScheduleConfirmation() {
  return (
    <div data-thanks-schedule className="min-h-screen relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-3 h-3 bg-pink-400 rounded-full opacity-60" />
        <div className="absolute top-20 right-20 w-4 h-4 bg-yellow-400 rounded-full opacity-60" />
        <div className="absolute top-40 left-1/4 w-2 h-2 bg-cyan-400 rounded-full opacity-60" />
        <div className="absolute top-60 right-1/3 w-3 h-3 bg-purple-400 rounded-full opacity-60" />
        <div className="absolute bottom-40 left-20 w-4 h-4 bg-pink-300 rounded-full opacity-60" />
        <div className="absolute top-32 right-1/4 w-8 h-8 border-2 border-pink-300 rounded-full opacity-40" />
        <div className="absolute bottom-32 left-1/4 w-6 h-6 border-2 border-cyan-300 rounded-full opacity-40" />
        <div className="absolute top-24 left-1/3 w-12 h-1 bg-purple-300 opacity-30 rotate-45" />
      </div>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-20 relative z-10">
        <h1 className="text-center mb-12 md:mb-16" style={{ fontSize: 'clamp(44px, 8vw, 150px)', fontFamily: 'var(--font-paytone-one)', lineHeight: '1.01', color: '#440099' }}>
          ¡Reunión confirmada!
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
          <div className="space-y-6">
            <h2 className="playful-h2" style={{ color: '#440099' }}>Tu reunión con Playful ya está reservada.</h2>
            <p className="playful-contenido-p">Revisa el correo de confirmación y añade el evento a tu calendario. Si no lo ves en unos minutos, mira también la carpeta de spam o promociones.</p>
            <p className="playful-contenido-p">En la llamada hablaremos de tu e-commerce, de lo que quieres resolver y de si somos el equipo adecuado para acompañarte.</p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img src="/images/contacto-imagen.png" alt="" className="w-full max-w-md" />
          </div>
        </div>
        <section className="space-y-8 max-w-3xl mx-auto">
          <h2 className="playful-h2 text-center" style={{ color: '#440099' }}>Qué conviene tener a mano</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['Contexto de tu marca', 'En qué canal vendes hoy, qué ya funciona y dónde se traba la operación.', '#C9B4FF'],
              ['El objetivo de esta conversación', 'Qué quieres salir entendiendo: alcance, timing o si encajamos para el siguiente paso.', '#72E3D8'],
              ['Acceso a tu web o tienda', 'Un enlace basta. Lo revisamos juntos durante la llamada.', '#FFE066'],
              ['Preguntas abiertas', 'Dudas de migración, checkout, catálogo o equipo. Anótalas para no dejarlas fuera.', '#FFB4A2'],
            ].map(([title, body, color]) => (
              <div key={title} className="rounded-3xl p-6 md:p-8 text-[#2A0064]" style={{ backgroundColor: color }}>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center px-8 py-4 rounded-full font-semibold text-white bg-[#5724AB] shadow-md hover:bg-[#440099] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#440099]"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
