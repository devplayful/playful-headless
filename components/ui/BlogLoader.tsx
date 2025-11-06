'use client';

export function BlogLoader() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#39DDCB] border-r-transparent">
          <span className="sr-only">Cargando...</span>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-700">Cargando artículo...</p>
      </div>
    </div>
  );
}
