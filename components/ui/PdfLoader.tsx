'use client';

interface PdfLoaderProps {
  progress: number;
}

export function PdfLoader({ progress }: PdfLoaderProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Generando PDF...</h3>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-[#39DDCB] h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-600 text-center">
          {progress < 100 
            ? `Procesando... ${Math.round(progress)}%`
            : '¡Listo! Preparando la descarga...'
          }
        </p>
      </div>
    </div>
  );
}
