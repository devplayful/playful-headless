'use client';

import { useMemo } from 'react';
import { readConvParam } from '@/lib/analytics/book-appointment';

const SCHEDULE_MESSAGE =
  'Solicitud recibida. Tu reunión aún no está confirmada: el equipo revisa tus respuestas y te escribe en 1 día laborable.';

export default function GraciasScheduleBody({ children }: { children: React.ReactNode }) {
  const isSchedule = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return readConvParam(window.location.search) === 'Schedule';
  }, []);

  if (isSchedule) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-20 relative z-10 text-center space-y-6">
        <h1
          className="text-center mb-8"
          style={{
            fontSize: 'clamp(44px, 8vw, 150px)',
            fontFamily: 'var(--font-paytone-one)',
            lineHeight: '1.01',
            color: '#440099',
          }}
        >
          ¡Recibimos tu caso!
        </h1>
        <p className="playful-contenido-p max-w-2xl mx-auto">{SCHEDULE_MESSAGE}</p>
      </div>
    );
  }

  return <>{children}</>;
}
