import Image from 'next/image';
import {
  SOYTECHNO_ARTICLE_JSON_LD,
  SOYTECHNO_CTA,
  SOYTECHNO_SIBLING_LINKS,
} from '@/utils/soytechno-addons';

export default function SoyTechnoAddons() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(SOYTECHNO_ARTICLE_JSON_LD),
        }}
      />

      <nav className="py-12 bg-[#FEF7FF]" aria-label="Casos hermanos">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <ul className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center">
            {SOYTECHNO_SIBLING_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[#2A0064] underline underline-offset-4 hover:text-[#440099]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <section className="py-0 pb-20 bg-[#FEF7FF]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative w-full h-[280px] sm:h-[360px]">
              <Image
                src={SOYTECHNO_CTA.illustration}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2A0064] mb-6">
                {SOYTECHNO_CTA.headline}
              </h2>
              <p className="text-lg text-[#4A4453] leading-relaxed mb-8">
                {SOYTECHNO_CTA.preamble}
              </p>
              <a
                href={SOYTECHNO_CTA.href}
                className="inline-block bg-[#440099] text-white hover:bg-[#5B21B6] font-semibold py-3 px-8 rounded-full transition-all duration-300 no-underline"
              >
                {SOYTECHNO_CTA.buttonLabel}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
