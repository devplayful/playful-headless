'use client';

import { useRef, useState } from 'react';

export default function CopyFirma({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<'idle' | 'ok' | 'error'>('idle');

  const copiarSeleccion = () => {
    const el = ref.current;
    if (!el) return false;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    sel?.removeAllRanges();
    return ok;
  };

  const copiar = async () => {
    const texto = ref.current?.innerText ?? '';
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([texto], { type: 'text/plain' }),
          }),
        ]);
        setEstado('ok');
        return;
      }
    } catch {
      /* sigue con el respaldo */
    }
    setEstado(copiarSeleccion() ? 'ok' : 'error');
  };

  return (
    <div>
      <div style={{ background: '#fff', border: '1px solid #E9D7FF', padding: 12, overflowX: 'auto' }}>
        <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <button
        type="button"
        onClick={copiar}
        style={{ marginTop: 16, background: '#440099', color: '#fff', border: 0, padding: '12px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', borderRadius: 6 }}
      >
        Copiar firma
      </button>
      <span role="status" style={{ marginLeft: 12, fontSize: 14 }}>
        {estado === 'ok' && '¡Copiada! Ahora pégala en Gmail.'}
        {estado === 'error' && 'No se pudo copiar: selecciona la firma y pulsa Ctrl/Cmd + C.'}
      </span>
    </div>
  );
}
