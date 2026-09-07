import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const form = readFileSync(
  new URL('../../app/contactar-agencia-de-marketing-digital/ContactPageClient.tsx', import.meta.url),
  'utf8',
);
const endpoint = readFileSync(
  new URL('../../wordpress-contact-endpoint.php', import.meta.url),
  'utf8',
);

const approvedCopy = {
  decisionRole: [
    ['owner', 'Soy dueño/a, socio/a o cofundador/a'],
    ['decision_lead', 'Lidero e-commerce, marketing u operaciones y participo en la decisión'],
    ['researching_for_other', 'Estoy investigando para otra persona/equipo'],
    ['other', 'Otro'],
  ],
  salesModel: [
    ['d2c', 'Vendemos principalmente D2C'],
    ['d2c_b2b', 'Combinamos D2C y B2B'],
    ['amazon', 'Vendemos principalmente en Amazon'],
    ['mercado_libre', 'Vendemos principalmente en Mercado Libre'],
    ['marketplaces_other', 'Vendemos principalmente en otros marketplaces'],
    ['marketplace_to_d2c', 'Vendemos en marketplaces y queremos dar el salto a D2C'],
    ['pre_d2c', 'Estamos preparando nuestra primera venta directa D2C'],
    ['not_online_or_unsure', 'No vendemos D2C / no estoy seguro'],
    ['other', 'Otro'],
  ],
  monthlyRevenue: [
    ['over_100k', 'Más de US$100.000'],
    ['50k_100k', 'US$50.000–100.000'],
    ['10k_50k', 'US$10.000–50.000'],
    ['under_10k', 'Menos de US$10.000'],
    ['prefer_not_to_say', 'Prefiero no compartirlo'],
    ['other', 'Otro'],
  ],
  projectTiming: [
    ['0_30_days', 'Quiero iniciar un proyecto en los próximos 30 días'],
    ['1_3_months', 'Estoy preparando un proyecto para los próximos 1–3 meses'],
    ['evaluating', 'Estoy evaluando opciones'],
    ['researching', 'Solo estoy investigando'],
    ['other', 'Otro'],
  ],
} as const;

function selectOptions(name: keyof typeof approvedCopy): Array<[string, string]> {
  const match = form.match(new RegExp(
    `<select\\b(?=[^>]*\\bname="${name}")[\\s\\S]*?<\\/select>`,
  ));
  assert(match, `missing ${name} selector`);
  return Array.from(match[0].matchAll(/<option value="([^"]+)"[^>]*>([^<]+)<\/option>/g), (item) => [
    item[1],
    item[2],
  ]);
}

test('qualification selectors use the approved copy exactly', () => {
  for (const [field, options] of Object.entries(approvedCopy)) {
    assert.deepEqual(selectOptions(field as keyof typeof approvedCopy), options, field);
  }
});

test('contact email renders the same approved labels for captured values', () => {
  for (const options of Object.values(approvedCopy)) {
    for (const [value, label] of options) {
      if (value !== 'other') assert(endpoint.includes(`'${value}' => '${label}'`), label);
    }
  }
});
