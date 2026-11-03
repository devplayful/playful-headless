/** Calendario de prueba Ops «QA – Reunión Playful filtro» (no secreto). */
export const QA_FILTRO_CALENDAR_ID = 'AR82Tqlm75JTU8QMk5ID';

export const QA_FILTRO_CALENDAR_WIDGET_URL =
  `https://api.leadconnectorhq.com/widget/booking/${QA_FILTRO_CALENDAR_ID}`;

/** IDs de campos de contacto GHL (Ops, 3 nov 2026). */
export const QA_GHL_FIELD_IDS = {
  calif_vende: 'N3KecyMGOzja0WXaepa6',
  calif_plataforma: 'MjGWYbuvGxAGWxXIgBy7',
  calif_facturacion_mensual: '4OFJM9rR35vlo2fJ1ute',
  calif_tipo_negocio: 'b5umKsv1lwThhHZcdC1r',
  calif_otros_canales: 'RZ9DvJMICZM6whVplLp2',
  calif_equipo: 'krt18ndMdsEW0LNMwVMb',
} as const;

export const QA_GHL_REVENUE_VALUES = {
  under_10k: '<10k USD',
  '10k_50k': '10–50k USD',
  '50k_100k': '50–100k USD',
  '100k_250k': '100–250k USD',
  over_250k: '>250k USD',
} as const;
