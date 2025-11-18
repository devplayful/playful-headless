"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSliderSettings } from "../hooks/useSliderSettings";
import { getLatestBlogPosts } from "@/services/wordpress";

// Importación dinámica del Slider para asegurar que solo se cargue en el cliente
const Slider = dynamic(() => import("react-slick").then((mod) => mod.default), {
  ssr: false,
  loading: () => <div>Cargando...</div>,
});

// Importar estilos de slick
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/**
 * Componente BlogPosts - Muestra un slider de entradas de blog con diseño responsivo
 * @param {string} [title="¿Estás listo para dejar de perder y empezar a ganar?"] - Título principal del componente
 * @param {string} [subtitle] - Subtítulo descriptivo
 * @param {Array<Object>} [posts=[]] - Array de objetos con las entradas del blog
 * @param {string} [buttonText="¡Crece como ellos!"] - Texto del botón principal
 * @param {Function} [onButtonClick] - Función que se ejecuta al hacer clic en el botón
 * @param {string} [className] - Clases CSS adicionales para el contenedor principal
 * @param {string} [backgroundColor="#006A61"] - Color de fondo en formato hexadecimal o nombre de color CSS
 * @param {string} [textColor="white"] - Color del texto principal
 * @param {string} [buttonTextColor="#2A0064"] - Color del texto del botón principal
 * @param {string} [buttonBgColor="white"] - Color de fondo del botón principal
 * @param {number} [overlayOpacity=0.5] - Opacidad de la superposición (0 a 1)
 *
 * @example
 * // Uso básico con estilos por defecto
 * <BlogPosts />
 *
 * @example
 * // Personalización avanzada
 * <BlogPosts
 *   title="Nuestro Blog"
 *   subtitle="Descubre artículos sobre marketing digital"
 *   backgroundColor="#2A0064"
 *   textColor="#FFFFFF"
 *   buttonTextColor="#2A0064"
 *   buttonBgColor="#FFD700"
 *   overlayOpacity={0.7}
 *   overlayColor="#006A61"
 *   onButtonClick={() => console.log('Ver más artículos')}
 * />
 */

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string;
  slug: string;
  link: string;
}

interface BlogPostsProps {
  title?: string;
  subtitle?: string;
  posts?: BlogPost[];
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonTextColor?: string;
  buttonBgColor?: string;
  overlayOpacity?: number;
  overlayColor?: string;
}

const BlogPosts: React.FC<BlogPostsProps> = ({
  title = "¿Estás listo para dejar de perder y empezar a ganar?",
  subtitle = "Visita nuestro blog para descubrir lo que esta empresa de soluciones digitales puede aportar a tu estrategia con consejos que hacen que todo parezca más fácil que un truco de magia.",
  posts = [],
  buttonText = "¡Crece como ellos!",
  onButtonClick,
  className = "",
  backgroundColor = "#006A61",
  textColor = "#FEF7FF",
  buttonTextColor = "#2A0064",
  buttonBgColor = "#39DDCB",
  overlayOpacity = 0.5,
  overlayColor = "#006A61",
}) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const responsiveSettings = useSliderSettings();

  // Fetch blog posts on component mount
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        if (posts.length > 0) {
          setBlogPosts(posts);
        } else {
          const latestPosts = await getLatestBlogPosts(6);
          setBlogPosts(latestPosts);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        // Fallback to default posts if API fails
        const defaultPosts: BlogPost[] = Array(6)
          .fill(0)
          .map((_, i) => ({
            id: i + 1,
            title: "Cómo mejorar tu presencia en línea con estrategias de marketing digital efectivas",
            excerpt: "Descubre las mejores estrategias para mejorar tu presencia en línea y llegar a más clientes potenciales a través del marketing digital.",
            category: "Marketing Digital",
            date: "Hace 2 días",
            imageUrl: "/images/blog/placeholder.jpg",
            slug: "estrategias-marketing-digital",
            link: "#"
          }));
        setBlogPosts(defaultPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [posts]);

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8">
      <div
        className={`relative py-16 px-4 sm:px-6 lg:px-[4rem] rounded-3xl overflow-hidden ${className}`}
        style={
          {
            "--bg-color": backgroundColor,
            "--text-color": textColor,
            "--button-text-color": buttonTextColor,
            "--button-bg-color": buttonBgColor,
            "--overlay-opacity": overlayOpacity,
          } as React.CSSProperties
        }
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundColor: backgroundColor,
              backgroundImage: "url(/images/background.webp)",
            }}
          ></div>
        </div>

        {/* Semi-transparent overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `${overlayColor}${Math.round(overlayOpacity * 255)
              .toString(16)
              .padStart(2, "0")}`,
          }}
        ></div>

        <div className="max-w-7xl mx-auto relative z-0">
          {title && (
            <h3
              className="text-center text-3xl md:text-4xl font-normal mb-4"
              style={{ color: textColor }}
            >
              {title}
            </h3>
          )}

          {subtitle && (
            <p
              className="text-center text-lg mb-12 max-w-3xl mx-auto"
              style={{ color: `${textColor}CC` }}
            >
              {subtitle}
            </p>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="text-white">Cargando entradas del blog...</div>
            </div>
          ) : (
            <Slider
              {...{
                ...responsiveSettings,
                slidesToScroll: 1,
                autoplay: true,
              }}
              className="mx-[-15px]"
            >
              {blogPosts.map((post) => (
              <div key={`blog-${post.id}`} className="px-3 h-full">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg h-[480px] flex flex-col">
                  {/* Post Image */}
                  <div className="h-48 bg-gray-200 relative">
                    <a href={`/blog/${post.category.toLowerCase().replace(/\s+/g, '-')}/${post.slug}`} className="block w-full h-full">
                      <img
                        src={post.imageUrl || "/images/blog/placeholder.jpg"}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/blog/placeholder.jpg";
                        }}
                      />
                    </a>
                  </div>

                  {/* Category Badge */}
                  <div className="px-5 pt-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                      {post.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <a href={`/blog/${post.category.toLowerCase().replace(/\s+/g, '-')}/${post.slug}`}>
                      <h4 className="text-gray-900 font-bold text-xl mb-3 leading-tight line-clamp-2 hover:text-[#7C3AED] transition-colors cursor-pointer">
                        {post.title}
                      </h4>
                    </a>
                    <p className="text-gray-600 text-sm mb-5 flex-1 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">{post.date}</span>
                      <a
                        href={`/blog/${post.category.toLowerCase().replace(/\s+/g, '-')}/${post.slug}`}
                        className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium py-1.5 px-4 rounded-full transition-colors"
                      >
                        Leer más
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </Slider>
          )}

          <div className="text-center mt-12">
            <button
              onClick={onButtonClick}
              className="font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
              style={
                {
                  backgroundColor: buttonBgColor,
                  color: buttonTextColor,
                  "--tw-bg-opacity": 1,
                } as React.CSSProperties
              }
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPosts;
