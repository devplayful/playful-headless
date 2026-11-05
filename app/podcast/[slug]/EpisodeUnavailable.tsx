'use client';

export default function EpisodeUnavailable({
  kind,
}: {
  kind: 'unavailable' | 'unexpected';
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-xl px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Temporalmente no disponible</h1>
        <p className="text-xl text-gray-600 mb-8">
          {kind === 'unavailable'
            ? 'No pudimos consultar WordPress en este momento. Inténtalo de nuevo en unos minutos.'
            : 'No pudimos cargar el episodio. Inténtalo de nuevo.'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
