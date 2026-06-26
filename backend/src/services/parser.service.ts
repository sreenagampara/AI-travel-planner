import PdfService from './pdf.service';
import OcrService from './ocr.service';
import logger from '../utils/logger';
import AppError from '../utils/appError';
import STATUS_CODES from '../constants/statusCodes';

const pdfService = new PdfService();
const ocrService = new OcrService();

export class ParserService {
  /**
   * Orchestrates text extraction based on mimetype and normalizes the output
   */
  async parseDocument(fileBuffer: Buffer, mimetype: string): Promise<string> {
    let rawText = '';

    if (mimetype === 'application/pdf') {
      rawText = await pdfService.extractText(fileBuffer);
    } else if (
      mimetype === 'image/jpeg' ||
      mimetype === 'image/png' ||
      mimetype === 'image/jpg'
    ) {
      rawText = await ocrService.extractText(fileBuffer);
    } else {
      throw new AppError(
        `Unsupported mime type for parsing: ${mimetype}`,
        STATUS_CODES.BAD_REQUEST
      );
    }

    if (!rawText || rawText.trim().length === 0) {
      logger.warn('Text extraction succeeded but returned empty content.');
      return '';
    }

    return this.normalizeText(rawText);
  }

  /**
   * Normalizes raw extracted text for optimized LLM consumption
   */
  private normalizeText(text: string): string {
    return text
      // Replace carriage returns
      .replace(/\r/g, '')
      // Strip control / non-printable characters except newlines/tabs
      .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      // Trim spaces at the ends of lines
      .split('\n')
      .map((line) => line.trim())
      // Filter out redundant empty lines (only allow single breaks)
      .filter((line, index, arr) => line !== '' || (index > 0 && arr[index - 1] !== ''))
      .join('\n')
      .trim();
  }
}

export default ParserService;
