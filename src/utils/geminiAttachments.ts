import mammoth from 'mammoth/mammoth.browser';
import * as XLSX from 'xlsx';

export interface GeminiAttachment {
  name: string;
  mimeType: string;
  size: number;
  data?: string;
  text?: string;
}

const TEXT_FILE = /\.(txt|csv|md|json|ts|tsx|js|jsx|html|css|xml|yaml|yml)$/i;
const WORD_FILE = /\.docx$/i;
const SHEET_FILE = /\.(xlsx|xls)$/i;

function readDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export async function prepareGeminiAttachment(file: File): Promise<GeminiAttachment> {
  if (file.size > 20 * 1024 * 1024) throw new Error(`${file.name} is larger than 20 MB.`);
  const base = { name: file.name, mimeType: file.type || 'application/octet-stream', size: file.size };
  if (file.type.startsWith('text/') || TEXT_FILE.test(file.name)) {
    return { ...base, text: await file.text() };
  }
  if (WORD_FILE.test(file.name)) {
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return { ...base, data: await readDataUrl(file), text: result.value.trim() };
  }
  if (SHEET_FILE.test(file.name)) {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const text = workbook.SheetNames.map(name => `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(workbook.Sheets[name])}`).join('\n\n');
    return { ...base, data: await readDataUrl(file), text: text.trim() };
  }
  return { ...base, data: await readDataUrl(file) };
}

export async function prepareGeminiAttachments(files: File[]) {
  return Promise.all(files.map(prepareGeminiAttachment));
}
