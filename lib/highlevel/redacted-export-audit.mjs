import { createHash } from 'node:crypto';

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error('CSV incompleto: comillas sin cerrar.');
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }

  return rows.filter((entry) => entry.some((value) => value !== ''));
}

export const D2C_EXPORT_POLICY = Object.freeze({
  pipelines: new Set(['D2C', 'D2C LEGACY - prospeccion fria (no usar)']),
  stages: new Set([
    'Lupa',
    'Toque 1',
    'Follow-up',
    'Respondió',
    'Meeting',
    'Propuesta',
    'Cliente',
    'No fit',
  ]),
  statuses: new Set(['open', 'won', 'lost', 'abandoned']),
});

function countValues(records, index, allowedValues, label) {
  const counts = new Map();
  for (const record of records) {
    const value = record[index];
    if (!value || !allowedValues.has(value)) {
      throw new Error(`El export contiene un valor no permitido en ${label}.`);
    }
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

export function auditHighLevelOpportunityExport(buffer, policy = D2C_EXPORT_POLICY) {
  const text = buffer.toString('utf8').replace(/^\uFEFF/, '');
  const rows = parseCsv(text);
  if (rows.length < 1) throw new Error('El export no contiene cabecera.');

  const [headers, ...records] = rows;
  const required = ['secuencia', 'fase', 'estado'];
  const indexes = Object.fromEntries(required.map((name) => [name, headers.indexOf(name)]));
  const missing = required.filter((name) => indexes[name] === -1);
  if (missing.length) throw new Error(`Faltan columnas de configuración: ${missing.join(', ')}.`);

  return {
    sha256: createHash('sha256').update(buffer).digest('hex'),
    bytes: buffer.byteLength,
    rows: records.length,
    pipelineCounts: countValues(records, indexes.secuencia, policy.pipelines, 'pipeline'),
    stageCounts: countValues(records, indexes.fase, policy.stages, 'etapa'),
    statusCounts: countValues(records, indexes.estado, policy.statuses, 'estado'),
  };
}
