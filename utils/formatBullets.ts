/**
 * Convierte líneas que empiezan con "-" en una lista HTML de bullets
 * @param text Texto que puede contener líneas con "-"
 * @returns JSX element con lista HTML o texto normal
 */
export function formatTextWithBullets(text: string): { __html: string } {
  if (!text) return { __html: '' };

  // Dividir el texto en líneas
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  // Verificar si hay líneas con bullets
  const hasBullets = lines.some(line => line.startsWith('-'));
  
  if (!hasBullets) {
    // Si no hay bullets, devolver el texto normal
    return { __html: text };
  }

  // Separar líneas con bullets y sin bullets
  let html = '';
  let inList = false;
  
  for (const line of lines) {
    if (line.startsWith('-')) {
      // Línea con bullet
      if (!inList) {
        html += '<ul class="list-disc pl-6 space-y-2">';
        inList = true;
      }
      // Remover el "-" del inicio y agregar como <li>
      const content = line.substring(1).trim();
      html += `<li class="text-base md:text-lg text-gray-700 leading-relaxed">${content}</li>`;
    } else {
      // Línea sin bullet
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p class="text-base md:text-lg text-gray-700 leading-relaxed mb-4">${line}</p>`;
    }
  }
  
  // Cerrar la lista si está abierta
  if (inList) {
    html += '</ul>';
  }
  
  return { __html: html };
}

/**
 * Verifica si un texto contiene bullets (líneas que empiezan con "-")
 */
export function hasBulletPoints(text: string): boolean {
  if (!text) return false;
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  return lines.some(line => line.startsWith('-'));
}
