import type { Block } from 'payload';

const faqItemsField = {
  name: 'items',
  type: 'array' as const,
  required: true,
  fields: [
    { name: 'question', type: 'text' as const, required: true },
    { name: 'answer', type: 'textarea' as const, required: true },
  ],
};

export const HeroServicioBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'h1', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
    { name: 'subline', type: 'text' },
    { name: 'ctaLabel', type: 'text' },
    { name: 'ctaHref', type: 'text' },
    { name: 'contactLinkLabel', type: 'text' },
    { name: 'contactLinkHref', type: 'text' },
    {
      name: 'illustrationSlot',
      type: 'text',
      admin: { description: 'Identificador de ilustración (p. ej. hero, servicio-diseno).' },
    },
    { name: 'imageUrl1x', type: 'text', admin: { description: 'URL o ruta /images/… (@1x).' } },
    { name: 'imageUrl2x', type: 'text', admin: { description: 'URL o ruta @2x (opcional).' } },
  ],
};

export const TextoServicioBlock: Block = {
  slug: 'texto',
  labels: { singular: 'Texto', plural: 'Textos' },
  fields: [
    { name: 'h2', type: 'text' },
    { name: 'body', type: 'textarea', required: true },
    { name: 'align', type: 'select', options: ['left', 'center'], defaultValue: 'left' },
  ],
};

export const VentajasServicioBlock: Block = {
  slug: 'ventajas',
  labels: { singular: 'Lista de ventajas', plural: 'Listas de ventajas' },
  fields: [
    { name: 'h2', type: 'text' },
    { name: 'intro', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { name: 'lead', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'body', type: 'textarea', required: true },
        { name: 'imageUrl', type: 'text' },
      ],
    },
  ],
};

export const TarjetasServicioBlock: Block = {
  slug: 'tarjetas',
  labels: { singular: 'Tarjetas de servicio', plural: 'Tarjetas de servicio' },
  fields: [
    { name: 'h2', type: 'text' },
    { name: 'intro', type: 'textarea' },
    { name: 'extraParagraph', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
        { name: 'illustrationSlot', type: 'text' },
        { name: 'imageUrl', type: 'text' },
        {
          name: 'cardColor',
          type: 'select',
          options: ['purple', 'yellow', 'mint', 'pink', 'none'],
          defaultValue: 'none',
        },
      ],
    },
  ],
};

export const BandaMoradaServicioBlock: Block = {
  slug: 'bandaMorada',
  labels: { singular: 'Banda morada', plural: 'Bandas moradas' },
  fields: [
    { name: 'h2', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
  ],
};

export const LogosCasosServicioBlock: Block = {
  slug: 'logosCasos',
  labels: { singular: 'Logos / casos', plural: 'Logos / casos' },
  fields: [
    { name: 'h2', type: 'text' },
    { name: 'quote', type: 'textarea' },
    { name: 'attribution', type: 'text' },
    {
      name: 'caseSlugs',
      type: 'array',
      admin: { description: 'Slugs de casos de éxito para el carrusel (Shopify).' },
      fields: [{ name: 'slug', type: 'text', required: true }],
    },
  ],
};

export const FaqServicioBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [{ name: 'h2', type: 'text' }, faqItemsField],
};

export const CtaServicioBlock: Block = {
  slug: 'cta',
  labels: { singular: 'CTA', plural: 'CTAs' },
  fields: [
    { name: 'h2', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'question', type: 'text' },
    { name: 'buttonLabel', type: 'text', required: true },
    { name: 'buttonHref', type: 'text', required: true },
    { name: 'imageUrl', type: 'text' },
    { name: 'contentBgColor', type: 'text', defaultValue: '#B3FFF3' },
  ],
};

export const ElementorServicioBlock: Block = {
  slug: 'elementor',
  labels: { singular: 'Cuerpo Elementor (WP)', plural: 'Cuerpos Elementor' },
  fields: [
    { name: 'pageId', type: 'number', required: true },
    { name: 'html', type: 'code', required: true, admin: { language: 'html' } },
    {
      name: 'stylesheetIds',
      type: 'json',
      required: true,
      admin: { description: 'Lista de IDs de hojas Elementor (post + widgets).' },
    },
  ],
};

export const CimaBreakerServicioBlock: Block = {
  slug: 'cimaBreaker',
  labels: { singular: 'Separador Premios CIMA', plural: 'Separadores CIMA' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      options: ['shopify', 'ecommerce'],
      defaultValue: 'shopify',
      required: true,
    },
  ],
};

export const ModuloExtraServicioBlock: Block = {
  slug: 'moduloExtra',
  labels: { singular: 'Módulo extra', plural: 'Módulos extra' },
  fields: [
    {
      name: 'kind',
      type: 'select',
      options: ['testimonials', 'relatedBlog'],
      required: true,
    },
  ],
};

export const servicioBlocks: Block[] = [
  HeroServicioBlock,
  TextoServicioBlock,
  VentajasServicioBlock,
  TarjetasServicioBlock,
  BandaMoradaServicioBlock,
  LogosCasosServicioBlock,
  FaqServicioBlock,
  CtaServicioBlock,
  ElementorServicioBlock,
  CimaBreakerServicioBlock,
  ModuloExtraServicioBlock,
];
