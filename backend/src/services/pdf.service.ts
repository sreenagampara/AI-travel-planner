import pdf from 'pdf-parse';
import logger from '../utils/logger';

export class PdfService {
  async extractText(pdfBuffer: Buffer): Promise<string> {
    try {
      logger.info('Starting PDF text extraction...');
      const data = await pdf(pdfBuffer);
      logger.info(`Successfully parsed PDF document. Character length: ${data.text.length}`);
      return data.text;
    } catch (error: any) {
      logger.error(`Error parsing PDF document: ${error.message}`);
      throw new Error(`Failed to parse PDF document: ${error.message}`);
    }
  }
}

export default PdfService;
