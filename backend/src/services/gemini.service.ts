import { env } from '../config/env';
import { genAI } from '../config/gemini';
import logger from '../utils/logger';
import { validateTravelData, validateItineraryData, TravelData, ItineraryData } from '../validators/gemini.validator';

export class GeminiService {
  private parseJsonResponse<T>(responseText: string): T {
    try {
      return JSON.parse(responseText) as T;
    } catch (parseError: any) {
      logger.warn('Gemini response invalid JSON, attempting fallback cleanup.');
      const cleaned = responseText
        .replace(/^[^\{\[]+/, '')
        .replace(/[^\}\]]+$/, '');
      return JSON.parse(cleaned) as T;
    }
  }

  /**
   * Analyzes raw text extracted from booking documents and returns a structured JSON of travel data.
   */
  async extractTravelData(documentText: string): Promise<TravelData> {
    try {
      logger.info(`Calling Gemini model ${env.GEMINI_MODEL} to extract structured travel data...`);
      
      
      const systemInstruction = `
        You are an expert travel assistant specializing in parsing booking confirmations, tickets, and boarding passes.
        Analyze the raw text and extract all relevant travel entities.
        You must format your response as a valid JSON object matching the following structure:
        {
          "passengers": ["List of passenger full names found"],
          "flights": [
            {
              "flightNumber": "Flight carrier and number (e.g. UA123)",
              "airline": "Airline name",
              "departureAirport": "Airport name/code",
              "arrivalAirport": "Airport name/code",
              "departureTime": "Departure date and time (format: YYYY-MM-DD HH:MM)",
              "arrivalTime": "Arrival date and time (format: YYYY-MM-DD HH:MM)",
              "bookingReference": "Flight PNR/Confirmation Code"
            }
          ],
          "hotels": [
            {
              "hotelName": "Name of the hotel",
              "hotelAddress": "Address of the hotel",
              "checkIn": "Check-in date (format: YYYY-MM-DD)",
              "checkOut": "Check-out date (format: YYYY-MM-DD)",
              "bookingReference": "Hotel reservation code"
            }
          ],
          "bookingReferences": ["All unique booking references/codes found in the text"]
        }
        
        If a detail is not found in the text, leave the array empty or omit the property. Do not make up information.
      `;

      const prompt = `
        Raw Document Text:
        -----------------
        ${documentText}
        -----------------
        Extract the travel details now.
      `;

      const result = await genAI.models.generateContent({
  model: env.GEMINI_MODEL,
  contents: `${systemInstruction}

${prompt}`,
  config: {
    temperature: 0.1,
  },
});

const responseText = result.text ?? "";

      logger.debug(`Gemini Raw Response: ${responseText}`);
      const parsed = this.parseJsonResponse<TravelData>(responseText);
      return validateTravelData(parsed);
    } catch (error: any) {
      logger.error(`Error in Gemini extractTravelData: ${error.message}`);
      throw new Error(`Gemini travel data extraction failed: ${error.message}`);
    }
  }

  /**
   * Generates a complete travel itinerary based on the aggregated structured travel data.
   */
  async generateItinerary(travelData: TravelData): Promise<ItineraryData> {
    try {
      logger.info(`Calling Gemini model ${env.GEMINI_MODEL} to generate travel itinerary...`);
      
      

      const systemInstruction = `
        You are a premium AI Travel Planner. Generate a comprehensive day-by-day travel itinerary based on the provided travel data (flights, hotels, bookings).
        You must format your response as a valid JSON object matching the following structure:
        {
          "tripTitle": "A creative title for this trip (e.g. 5 Days in Tokyo)",
          "destination": "Primary destination name",
          "startDate": "Start date (YYYY-MM-DD)",
          "endDate": "End date (YYYY-MM-DD)",
          "summary": "A brief, welcoming overview of the trip and what the user can look forward to.",
          "dayWiseItinerary": [
            {
              "dayNumber": 1,
              "date": "YYYY-MM-DD",
              "theme": "Day theme (e.g. Exploring Shinjuku)",
              "schedule": [
                {
                  "time": "HH:MM",
                  "activity": "Detailed activity title",
                  "description": "Short description of what to do/see.",
                  "type": "transportation | hotel | activity | meal | attraction",
                  "location": "Name of the location/venue"
                }
              ]
            }
          ],
          "accommodationDetails": [
            {
              "hotelName": "Hotel Name",
              "checkInDate": "YYYY-MM-DD",
              "checkOutDate": "YYYY-MM-DD",
              "notes": "Helpful check-in details, check-in window, amenities, etc."
            }
          ],
          "packingSuggestions": ["List of item suggestions based on season/destination"],
          "importantReminders": ["Critical tips: visa, local custom, currency, weather details"],
          "emergencyContacts": [
            {
              "name": "Name of service (e.g. Local Police, Hotel Desk, Embassy)",
              "phone": "Phone number"
            }
          ]
        }

        Make sure you include realistic times for activities, recommend nearby tourist spots, and handle travel days (flights check-in/check-out) beautifully.
        Avoid vague descriptions. Be descriptive, creative, and professional.
      `;

      const prompt = `
        Structured Travel Data:
        ${JSON.stringify(travelData, null, 2)}

        Generate the complete day-by-day travel itinerary.
      `;

 const result = await genAI.models.generateContent({
  model: env.GEMINI_MODEL,
  contents: `${systemInstruction}

${prompt}`,
  config: {
    temperature: 0.7,
  },
});

const responseText = result.text ?? "";

      logger.debug(`Gemini Raw Response: ${responseText}`);
      const parsed = this.parseJsonResponse<ItineraryData>(responseText);
      return validateItineraryData(parsed);
    } catch (error: any) {
      logger.error(`Error in Gemini generateItinerary: ${error.message}`);
      throw new Error(`Gemini itinerary generation failed: ${error.message}`);
    }
  }
}

export default GeminiService;
