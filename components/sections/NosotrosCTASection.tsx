export default function NosotrosCTASection({
  imagePath = "/images/nosotros/cta-illustration.png",
  imageAlt = "Ilustración de crecimiento digital",
}: {
  imagePath?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative overflow-hidden mt-6 mb-0 pb-16 w-[calc(100%-40px)] max-w-[1200px] mx-auto">
      {/* Overlay de confeti para la sección CTA */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-stretch">
        {/* Sección de Imagen */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-6 bg-transparent">
          <div className="w-[452px] h-[557px] flex items-center justify-center">
            <img
              src={imagePath}
              alt={imageAlt}
              width={452}
              height={557}
              className="w-full h-full object-contain"
              style={{ display: 'block' }}
            />
          </div>
        </div>

        {/* Sección de Contenido */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center p-8 md:p-10 bg-[#B3FFF3] rounded-3xl">
          <h2 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] text-[#453A53] font-[700] text-[45px] leading-[52px] mb-6">
            No esperes más para empezar a ganar
          </h2>
          <p className="[font-family:var(--font-dm-sans),sans-serif] font-normal text-[16px] leading-[24px] text-[#453A53] max-w-[92%] min-[768px]:max-w-[620px] min-[1024px]:max-w-[680px] mt-2">
            Deja de arreglar tu web con parches y dejas de perder clientes por fallas que no puedes ver.
            Es hora de invertir en una solución profesional.
          </p>
          <p className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] font-[600] text-[28px] leading-[36px] text-[#453A53] mt-6">
            ¡Contáctanos y hagamos que tu sitio web trabaje para ti!
          </p>
          <a
            href="/contacto"
            className="inline-block bg-[#7c23ce] hover:bg-[#a99cec] text-white rounded-full px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 mt-5"
          >
            ¡Empieza ya!
          </a>
        </div>
      </div>
    </section>
  );
}
