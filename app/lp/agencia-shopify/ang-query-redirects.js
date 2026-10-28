/**
 * 308 /lp/agencia-shopify?ang=X → /lp/agencia-shopify/X, rest of the query kept.
 * Loaded by next.config.js. Not middleware.
 *
 * Next.js prepareDestination always merges the original query into the
 * destination, so `ang` cannot be stripped here without middleware.
 *
 * Slugs live in angles.js. Do not list ángulos here.
 */
module.exports = require('./angles');
