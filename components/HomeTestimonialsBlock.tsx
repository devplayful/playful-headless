import Image from 'next/image';

export interface HomeTestimonial {
  quote: string;
  name: string;
  role: string;
}

export default function HomeTestimonialsBlock({
  title,
  intro,
  items,
}: {
  title: string;
  intro: string;
  items: readonly HomeTestimonial[];
}) {
  const textStyle = { color: '#4A4453' };

  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-normal mb-4" style={textStyle}>
          {title}
        </h2>
        <p className="text-lg mb-12 max-w-3xl mx-auto" style={textStyle}>
          {intro}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-[1200px] mx-auto px-4">
        {items.map((item) => (
          <article
            key={item.name}
            className="bg-white rounded-3xl shadow-lg overflow-hidden w-full flex flex-col justify-center items-center text-center p-6 md:p-8"
          >
            <div className="w-20 h-20 relative mb-4">
              <Image
                src="/images/avatar-playful.svg"
                alt=""
                fill
                className="object-contain"
              />
            </div>
            <h4 className="font-semibold text-lg mb-1" style={textStyle}>
              {item.name}
            </h4>
            <p className="text-sm mb-4" style={textStyle}>
              {item.role}
            </p>
            <div className="flex justify-center mb-4">
              <div className="text-yellow-400 text-xl">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
            </div>
            <p className="text-sm md:text-base px-2">«{item.quote}»</p>
          </article>
        ))}
      </div>
    </>
  );
}
