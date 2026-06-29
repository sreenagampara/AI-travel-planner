import axios from 'axios';
import FileRepository from '../repositories/file.repository';
import TripRepository from '../repositories/trip.repository';
import ParserService from './parser.service';
import GeminiService from './gemini.service';
import logger from '../utils/logger';
import AppError from '../utils/appError';
import STATUS_CODES from '../constants/statusCodes';
import { Types } from 'mongoose';

const fileRepository = new FileRepository();
const tripRepository = new TripRepository();
const parserService = new ParserService();
const geminiService = new GeminiService();

export class ItineraryService {
  /**
   * Orchestrates the complete pipeline:
   * 1. Fetches uploaded file records from DB.
   * 2. Downloads files from Cloudinary.
   * 3. Extracts text from each document (PDF or OCR).
   * 4. Calls Gemini to parse text into structured JSON.
   * 5. Calls Gemini to generate the detailed itinerary.
   * 6. Saves the Trip to MongoDB and links the files.
   */
  async generateItineraryFromFiles(
    fileIds: string[],
    userId: Types.ObjectId | string
  ): Promise<any> {
    try {
      const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
      logger.info(`Starting itinerary generation pipeline for ${fileIds.length} files for user ${userId}`);

      // 1. Fetch file metadata records from database
      logger.info(`Fetching file records for fileIds: ${fileIds.join(', ')}`);
      const files = await fileRepository.findByUserId(userObjId);
      const selectedFiles = files.filter((f) => fileIds.includes(f._id.toString()));

      if (selectedFiles.length === 0) {
        throw new AppError(
          'No valid uploaded files found with the provided IDs.',
          STATUS_CODES.BAD_REQUEST
        );
      }
      logger.info(`Found ${selectedFiles.length} selected files.`);

      // 2. Download files & extract text
      let aggregatedText = '';
      
      for (const file of selectedFiles) {
        logger.info(`Attempting to download and parse file: ${file.filename} (${file.mimetype})`);
        try {
          // Download file buffer
          console.log("Cloudinary URL:", file.path);
          const response = await axios.get(file.path, {
            responseType: 'arraybuffer',
            timeout: 30000, // 30s timeout
          });
          logger.info(`Successfully downloaded file: ${file.filename}`);
          
          const buffer = Buffer.from(response.data);
          
          // Parse file text
          logger.info(`Starting text extraction for file: ${file.filename}`);
          const extractedText = await parserService.parseDocument(buffer, file.mimetype);
          logger.info(`Finished text extraction for file: ${file.filename}. Extracted ${extractedText.length} characters.`);
          
          aggregatedText += `\n--- Document: ${file.filename} ---\n${extractedText}\n`;
        } catch (downloadOrParseError: any) {
          logger.error(
            `Failed to download/parse file ${file.filename} (${file._id}): ${downloadOrParseError.message}`,
            { stack: downloadOrParseError.stack }
          );
          // Continue parsing other files if multiple exist, but throw if it's the only one
          if (selectedFiles.length === 1) {
            throw new AppError(
              `Failed to process document: ${downloadOrParseError.message}`,
              STATUS_CODES.UNPROCESSABLE_ENTITY
            );
          }
        }
      }

      if (aggregatedText.trim().length === 0) {
        throw new AppError(
          'Could not extract text from any of the provided documents.',
          STATUS_CODES.UNPROCESSABLE_ENTITY
        );
      }
      logger.info(`Aggregated text length: ${aggregatedText.length}`);

      // 3. Call Gemini to parse raw text into structured travel details
      logger.info('Calling Gemini for travel data extraction...');
      const travelData = await geminiService.extractTravelData(aggregatedText);
      logger.info('Successfully extracted structured travel details from Gemini.', { travelData });

      // 4. Call Gemini to build the detailed day-by-day itinerary
      logger.info('Calling Gemini for itinerary generation...');
      const itinerary = await geminiService.generateItinerary(travelData);
      logger.info('Successfully generated detailed itinerary from Gemini.', { itinerary });

      // 5. Create new Trip in database
      const tripTitle = itinerary.tripTitle || `Trip to ${itinerary.destination || 'Destination'}`;
      logger.info(`Saving new trip to MongoDB with title: ${tripTitle}`);
      
      const trip = await tripRepository.create({
        title: tripTitle,
        userId: userObjId,
        travelData,
        itinerary,
        isPublic: false,
      });
      logger.info(`Successfully saved Trip: ${trip._id}`);

      // 6. Link the uploaded files to the created trip ID
      logger.info(`Linking files ${selectedFiles.map((f) => f._id.toString()).join(', ')} to trip ${trip._id}`);
      await fileRepository.linkFilesToTrip(
        selectedFiles.map((f) => f._id.toString()),
        trip._id as Types.ObjectId
      );
      logger.info(`Successfully linked files to trip ${trip._id}`);

      logger.info(`Successfully finished itinerary pipeline. Saved Trip: ${trip._id}`);
      
      return trip;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error(`Error in itinerary generation pipeline: ${error.message}`, { stack: error.stack });
      throw new AppError(
        `Failed to generate itinerary: ${error.message}`,
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default ItineraryService;
