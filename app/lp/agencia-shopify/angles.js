/**
 * Única fuente: slug → titular.
 * generateStaticParams, el H1 y los 308 ?ang= salen de aquí.
 * Añadir, quitar o cambiar un ángulo: editar solo este archivo.
 */
const LP_META_ANGLE_TITLES = {
  generic: {
    tag: 'titular genérico',
    note: 'Cuando ang falta o no es válido se muestra el titular genérico. El texto de los ganchos sale de los creativos C1–C5 firmados. No se reescribe aquí.',
  },
  c1: {
    tag: 'titular C1',
    note: 'El mismo gancho que el C1 del anuncio. Caso destacado: [definir con el creativo final].',
  },
  c2: {
    tag: 'titular C2',
    note: 'El mismo gancho que el C2. Caso destacado: [definir con el creativo final].',
  },
  c3: {
    tag: 'titular C3',
    note: 'El mismo gancho que el C3. Caso destacado: [definir con el creativo final].',
  },
  c4: {
    tag: 'titular C4',
    note: 'El mismo gancho que el C4. Caso destacado: [definir con el creativo final].',
  },
  c5: {
    tag: 'titular C5',
    note: 'El mismo gancho que el C5. Caso destacado: [definir con el creativo final].',
  },
};

const DEFAULT_LP_META_ANGLE = 'generic';

const LP_META_STATIC_ANGLES = Object.keys(LP_META_ANGLE_TITLES);

if (!LP_META_ANGLE_TITLES[DEFAULT_LP_META_ANGLE]) {
  throw new Error(`DEFAULT_LP_META_ANGLE "${DEFAULT_LP_META_ANGLE}" must exist in LP_META_ANGLE_TITLES`);
}

function generateStaticAngleParams() {
  return LP_META_STATIC_ANGLES.map((ang) => ({ ang }));
}

function angQueryValues(ang) {
  return Array.from(new Set([ang, String(ang).toUpperCase()]));
}

const LP_META_ANG_QUERY_REDIRECTS = LP_META_STATIC_ANGLES.flatMap((ang) =>
  angQueryValues(ang).map((value) => ({
    source: '/lp/agencia-shopify',
    has: [{ type: 'query', key: 'ang', value }],
    destination: `/lp/agencia-shopify/${ang}`,
    permanent: true,
  })),
);

module.exports = {
  LP_META_ANGLE_TITLES,
  DEFAULT_LP_META_ANGLE,
  LP_META_STATIC_ANGLES,
  LP_META_ANG_QUERY_REDIRECTS,
  generateStaticAngleParams,
  angQueryValues,
};
