import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gracias — siguiente paso | Playful Agency',
  robots: { index: false, follow: false },
  alternates: { canonical: '/gracias' },
};

export default function ThankYouV2() {
  return (
    <div data-thanks-v2 className="min-h-screen relative overflow-hidden">
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
          ¡Recibimos tu caso!
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
          <div className="space-y-6">
            <h2 className="playful-h2" style={{ color: '#440099' }}>Pero espera… podemos acelerar el siguiente paso.</h2>
            <p className="playful-contenido-p">Gracias por compartirnos tu proyecto. Revisaremos tus datos. Si tu marca encaja con el perfil que ves abajo, puedes reservar una sesión sin esperar a que te contactemos.</p>
            <p className="playful-contenido-p">Hablemos de dónde está tu e-commerce, qué quieres resolver y si Playful es el equipo adecuado para acompañarte.</p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img src="/images/contacto-imagen.png" alt="" className="w-full max-w-md" />
          </div>
        </div>
        <section id="condiciones" className="scroll-mt-8 space-y-8">
          <h2 className="playful-h2 text-center" style={{ color: '#440099' }}>¿Esta sesión es para ti? Demos el siguiente paso si…</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['Decides sobre el proyecto', 'Eres dueño/a, socio/a o responsable de e-commerce, marketing u operaciones y participas en la decisión.', '#C9B4FF'],
              ['Tu marca apuesta por venta directa', 'Vendes D2C, o ya vendes en Amazon o Mercado Libre y quieres desarrollar tu propio canal directo.', '#72E3D8'],
              ['Ya tienes tracción', 'Tu negocio factura más de US$100.000 al mes en ventas online.', '#FFE066'],
              ['Quieres avanzar, no solo explorar', 'Tienes una necesidad concreta, quieres iniciar en los próximos tres meses y estás dispuesto/a a evaluar una inversión.', '#FFB4A2'],
            ].map(([title, body, color]) => (
              <div key={title} className="rounded-3xl p-6 md:p-8 text-[#2A0064]" style={{ backgroundColor: color }}>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="mt-8 text-center">
          <a href="https://playfulagency.com/reunion-playful" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center px-8 py-4 rounded-full font-semibold text-white bg-[#5724AB] shadow-md hover:bg-[#440099] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#440099]">
            Cumplo estas condiciones: agendar sesión
            <span className="sr-only"> (abre en otra pestaña)</span>
          </a>
          <p className="mt-3 text-sm text-[#453A53]">Sesión gratuita de evaluación comercial, sin compromiso de contratación.</p>
        </div>
        <section className="mt-12 md:mt-16 text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="playful-h2" style={{ color: '#440099' }}>Una conversación para evaluar trabajar juntos.</h2>
          <p className="playful-contenido-p">La sesión es gratuita y tiene una finalidad comercial: entender tu caso, evaluar cómo podemos ayudarte y, si hay encaje, definir los siguientes pasos para prepararte una propuesta y un presupuesto. Agendar no implica ningún compromiso de contratación.</p>
          <p className="text-sm text-[#453A53]">¿Todavía no es tu momento? No hace falta reservar ni reenviar el formulario. Revisaremos la solicitud que ya nos compartiste.</p>
        </section>
      </div>
    </div>
  );
}
