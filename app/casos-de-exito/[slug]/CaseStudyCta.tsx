import Image from 'next/image'
import Link from 'next/link'

type Props = {
  title: string
  description: string
  emphasis?: string
  buttonText: string
  buttonHref: string
  illustrationSrc: string
  illustrationAlt?: string
}

export default function CaseStudyCta({
  title,
  description,
  emphasis,
  buttonText,
  buttonHref,
  illustrationSrc,
  illustrationAlt = '',
}: Props) {
  return (
    <section className="py-4 bg-[#FEF7FF]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mx-auto w-full max-w-[1050px]">
          <div className="bg-[#B3FFF3] rounded-[26px] p-8 md:p-12 overflow-hidden mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Left: illustration */}
              <div className="flex items-center justify-center">
                <Image
                  src={illustrationSrc}
                  alt={illustrationAlt}
                  width={400}
                  height={425}
                  className="w-full max-w-[400px] h-auto object-contain"
                  sizes="(max-width: 768px) 90vw, 400px"
                  priority={false}
                />
              </div>

              {/* Right: content */}
              <div className="w-full flex flex-col items-center text-center">
                <h3 className="text-[30px] md:text-[34px] leading-tight font-paytone text-[#2A0064]">
                  {title}
                </h3>

                <p className="mt-4 text-base md:text-[16px]font-dmsans text-[#2A0064]/80 leading-relaxed">
                  {description}
                </p>

                {emphasis && (
                  <p className="mt-4 text-base md:text-[20px] font-paytone text-[#2A0064]">
                    {emphasis}
                  </p>
                )}

                <div className="mt-8 flex justify-center w-full">
                  <Link
                    href={buttonHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2A0064] text-white px-7 py-3 font-semibold transition-colors hover:bg-[#3C009C]"
                  >
                    {buttonText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
