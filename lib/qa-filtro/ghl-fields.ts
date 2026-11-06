/** Calendario de prueba Ops «QA – Reunión Playful filtro» (no secreto). */
export const QA_FILTRO_CALENDAR_ID = 'AR82Tqlm75JTU8QMk5ID';

export const QA_FILTRO_CALENDAR_WIDGET_URL =
  `https://api.leadconnectorhq.com/widget/booking/${QA_FILTRO_CALENDAR_ID}`;

/** IDs de campos de contacto GHL (Ops). */
export const QA_GHL_FIELD_IDS = {
  calif_vende: 'N3KecyMGOzja0WXaepa6',
  calif_plataforma: 'MjGWYbuvGxAGWxXIgBy7',
  calif_facturacion_online: '5XDauuTuOpii4rj2lNPl',
  calif_facturacion_otros_canales: '0U2Ppb0XQHjzEqIh0pCy',
  calif_tipo_negocio: 'b5umKsv1lwThhHZcdC1r',
  calif_otros_canales: 'RZ9DvJMICZM6whVplLp2',
  calif_equipo: 'krt18ndMdsEW0LNMwVMb',
} as const;

/** Valores exactos (en-dash U+2013) enviados a GHL en campos de facturación. */
export const QA_GHL_REVENUE_VALUES = {
  under_10k: '<10k USD',
  '10k_50k': '10–50k USD',
  '50k_100k': '50–100k USD',
  '100k_250k': '100–250k USD',
  over_250k: '>250k USD',
} as const;

export const QA_GHL_REVENUE_PAYLOAD_VALUES = Object.values(QA_GHL_REVENUE_VALUES);
