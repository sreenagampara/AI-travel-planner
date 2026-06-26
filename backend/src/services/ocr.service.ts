import Tesseract from 'tesseract.js';
import logger from '../utils/logger';

export class OcrService {
  async extractText(imageBuffer: Buffer): Promise<string> {
    try {
      logger.info('Starting Image OCR text extraction...');
      
      const result = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            logger.debug(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
          }
        },
      });

      const text = result.data.text;
      logger.info(`Successfully finished Image OCR. Character length: ${text.length}`);
      return text;
    } catch (error: any) {
      logger.error(`Error during OCR execution: ${error.message}`);
      throw new Error(`Failed to extract text from image: ${error.message}`);
    }
  }
}

export default OcrService;
