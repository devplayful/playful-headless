import { getBlogPostBySlug, getBlogPosts, type WPPost } from '@/services/wordpress';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import * as cheerio from 'cheerio';
import TableOfContents from '@/components/blog/TableOfContents';

export async function generateStaticParams() {
  const { posts } = await getBlogPosts(1, 100);
  return posts.map((post) => ({
    slug: [post.categories?.[0]?.slug || 'sin-categoria', post.slug],
  }));
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'UTC'
  };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

interface BlogPostPageProps {
  params: {
    slug: string[];
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // El array slug contiene [category, post-slug]
  const [category, postSlug] = params.slug;
  
  if (!postSlug) {
    notFound();
  }

  const post = await getBlogPostBySlug(postSlug);
  
  if (!post) {
    notFound();
  }

  // Verificar que la categoría en la URL coincida con la categoría del post (opcional)
  // Si el post tiene categorías, verificamos que la URL sea correcta
  const postCategory = post.categories?.[0]?.slug || 'sin-categoria';
  
  // Solo redirigir si la categoría es completamente diferente
  // Esto permite flexibilidad en caso de cambios de categoría
  if (post.categories && post.categories.length > 0 && postCategory !== category) {
    // En lugar de notFound(), podrías hacer un redirect a la URL correcta
    // Por ahora, permitimos que se muestre el contenido
    console.log(`Category mismatch: URL has "${category}" but post has "${postCategory}"`);
  }

  // Extraer encabezados para la tabla de contenidos
  const $ = cheerio.load(post.content?.rendered || '');
  const headings = $('h2, h3, h4')
    .map((_, el) => {
      const $el = $(el);
      let id = $el.attr('id') || '';
      const text = $el.text();
      
      // Si no tiene ID, generar uno y agregarlo al elemento
      if (!id) {
        id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        $el.attr('id', id);
      }
      
      return {
        text,
        slug: id
      };
    })
    .get() as Array<{ text: string; slug: string }>;
  
  // Actualizar el contenido con los IDs agregados
  const contentWithIds = $.html();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center space-x-2 mb-4">
            {post.categories && post.categories.length > 0 && (
              <Link 
                href={`/blog?category=${post.categories[0].slug}`}
                className="text-sm font-medium text-[#440099] hover:text-[#5500BB] transition-colors"
              >
                {post.categories[0].name}
              </Link>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2A0064] leading-tight mb-4">
            {post.title.rendered}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{formatDate(post.date)}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <article>
          {post.featured_media_url && (
            <div className="relative w-full h-64 md:h-80 lg:h-96 mb-12 rounded-2xl overflow-hidden">
              <Image
                src={post.featured_media_url}
                alt={post.featured_media_alt || post.title.rendered}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          
          {/* Table of Contents - Antes del contenido */}
          {headings.length > 0 && (
            <div className="mb-12">
              <TableOfContents items={headings.map(h => ({
                text: h.text,
                slug: `#${h.slug}`
              }))} />
            </div>
          )}
          
          <div 
            className="prose prose-lg max-w-none prose-headings:text-[#2A0064] prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#440099] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
            dangerouslySetInnerHTML={{ __html: contentWithIds }} 
          />
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Etiquetas
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="px-4 py-2 bg-[#F5F3FF] text-[#440099] rounded-full text-sm font-medium hover:bg-[#EDE9FE] transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
  const [, postSlug] = params.slug;
  
  if (!postSlug) {
    return {
      title: 'Artículo no encontrado',
    };
  }

  const post = await getBlogPostBySlug(postSlug);
  
  if (!post) {
    return {
      title: 'Artículo no encontrado',
    };
  }

  return {
    title: `${post.title.rendered} | Blog - Playful Agency`,
    description: post.excerpt?.rendered ? post.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 160) : '',
    openGraph: {
      title: `${post.title.rendered} | Blog - Playful Agency`,
      description: post.excerpt?.rendered ? post.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 160) : '',
      type: 'article',
      publishedTime: post.date,
      authors: [post.author_name || 'Playful Agency'],
      images: [
        {
          url: post.featured_media_url || '/images/og-blog.jpg',
          width: 1200,
          height: 630,
          alt: post.featured_media_alt || post.title.rendered,
        },
      ],
    },
  };
}
