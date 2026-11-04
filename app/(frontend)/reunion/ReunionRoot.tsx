'use client';

export default function ReunionRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="reunion-calificacion-root" data-reunion-calificacion-root>
      {children}
    </div>
  );
}
