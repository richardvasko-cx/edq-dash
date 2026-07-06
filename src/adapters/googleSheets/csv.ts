// Safe CSV parsing + cell coercion for the Looker demo adapters.
// Handles quoted fields, embedded commas, escaped quotes ("") and CRLF.
// Coercion rules (per brief §16): blank cell -> null (never 0); numbers via strict parse;
// yes/no & true/false coerced explicitly.

export type RawRow = Record<string, string>;

/** Parse a CSV string into header + raw string rows. Tolerant of quotes, commas, CRLF. */
export function parseCsv(text: string): { headers: string[]; rows: RawRow[] } {
  const records = tokenize(text);
  if (records.length === 0) return { headers: [], rows: [] };

  const headers = records[0].map(h => h.trim());
  const rows: RawRow[] = [];

  for (let i = 1; i < records.length; i++) {
    const fields = records[i];
    // Skip blank trailing lines.
    if (fields.length === 1 && fields[0].trim() === '') continue;
    const row: RawRow = {};
    headers.forEach((header, idx) => {
      row[header] = fields[idx] ?? '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

/** Split CSV text into an array of records, each an array of raw field strings. */
function tokenize(text: string): string[][] {
  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      record.push(field);
      field = '';
    } else if (ch === '\n') {
      record.push(field);
      records.push(record);
      record = [];
      field = '';
    } else if (ch === '\r') {
      // swallow; the following \n closes the record
    } else {
      field += ch;
    }
  }

  // Flush the final field/record if the file didn't end with a newline.
  if (field !== '' || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  return records;
}

/** Trimmed string, or null when blank. */
export function str(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/** Strict number, or null when blank / non-numeric. Strips thousands separators and a trailing %. */
export function num(value: string | undefined): number | null {
  if (value === undefined) return null;
  let trimmed = value.trim();
  if (trimmed === '') return null;
  trimmed = trimmed.replace(/,/g, '');
  let isPercent = false;
  if (trimmed.endsWith('%')) {
    isPercent = true;
    trimmed = trimmed.slice(0, -1).trim();
  }
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) return null;
  return isPercent ? parsed / 100 : parsed;
}

/** Explicit boolean coercion (yes/no, true/false, 1/0, y/n). Null when blank or unrecognised. */
export function bool(value: string | undefined): boolean | null {
  if (value === undefined) return null;
  const v = value.trim().toLowerCase();
  if (v === '') return null;
  if (v === 'true' || v === 'yes' || v === 'y' || v === '1') return true;
  if (v === 'false' || v === 'no' || v === 'n' || v === '0') return false;
  return null;
}

/** Throws if the parsed headers are missing any required Looker field names. */
export function validateColumns(headers: string[], required: readonly string[], viewName: string): void {
  const present = new Set(headers);
  const missing = required.filter(c => !present.has(c));
  if (missing.length > 0) {
    throw new Error(
      `Looker view "${viewName}" CSV is missing required columns: ${missing.join(', ')}`,
    );
  }
}
