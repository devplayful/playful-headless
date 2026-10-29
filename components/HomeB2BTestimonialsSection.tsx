const quotes = [
  {
    text: 'Personalmente me siento mucho más seguro desde que trabajo con ustedes. Me han quitado una carga de trabajo importante y el proceso ha sido cero estresante.',
    cite: 'Federico Vera, e-Commerce Consultant de Odwalla.',
  },
  {
    text: 'Uno de los grandes logros fue que cumplimos con los plazos establecidos para las páginas web, algo clave para nuestro cliente final. Esto no solo generó buenos resultados, sino que también nos abrió la puerta para avanzar con nuevos proyectos. Estamos muy contentos.',
    cite: 'Federico Vera, e-Commerce Consultant de Odwalla.',
  },
  {
    text: 'Se ve que la página está hecha en base a los requerimientos que nosotros teníamos y más. No sólo se quedaron con la idea de vender el producto, sino que también buscaron más soluciones, como agregar un comparador de productos para que la gente pueda verlo.',
    cite: 'Eva Cristina Luciani, e-Commerce Manager de Soytechno.com.',
  },
] as const;

export default function HomeB2BTestimonialsSection({ className }: { className?: string }) {
  return (
    <section data-cta-section="testimonios-home" className={className}>
      <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-8">
        <h2 className="playful-h2 text-center">
          Lo que dicen las marcas con las que trabajamos
        </h2>
        {quotes.map((q) => (
          <blockquote
            key={q.cite + q.text.slice(0, 24)}
            className="border-l-4 border-[#5724AB] pl-6 space-y-3"
          >
            <p className="playful-contenido-p italic">&ldquo;{q.text}&rdquo;</p>
            <footer className="playful-contenido-p text-sm not-italic">{q.cite}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
