import pdfParse from 'pdf-parse';

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  const text = data.text.trim();

  if (!text || text.length < 50) {
    throw new Error('Could not extract text from PDF');
  }

  return text;
}
