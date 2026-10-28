/**
 * 308 /lp/agencia-shopify?ang=X → /lp/agencia-shopify/X, rest of the query kept.
 * Loaded by next.config.js. Not middleware.
 */
const LP_META_STATIC_ANGLES = ['generic', 'c1', 'c2', 'c3', 'c4', 'c5'];

const LP_META_ANG_QUERY_REDIRECTS = LP_META_STATIC_ANGLES.flatMap((ang) => {
  const values = ang === 'generic' ? ['generic', 'GENERIC'] : [ang, ang.toUpperCase()];
  return values.map((value) => ({
    source: '/lp/agencia-shopify',
    has: [{ type: 'query', key: 'ang', value }],
    destination: `/lp/agencia-shopify/${ang}`,
    permanent: true,
  }));
});

module.exports = {
  LP_META_STATIC_ANGLES,
  LP_META_ANG_QUERY_REDIRECTS,
};
