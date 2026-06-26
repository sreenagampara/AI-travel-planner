import { z } from 'zod';

export const travelDataSchema = z.object({
  passengers: z.array(z.string()).optional().default([]),
  flights: z
    .array(
      z.object({
        flightNumber: z.string().optional(),
        airline: z.string().optional(),
        departureAirport: z.string().optional(),
        arrivalAirport: z.string().optional(),
        departureTime: z.string().optional(),
        arrivalTime: z.string().optional(),
        bookingReference: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  hotels: z
    .array(
      z.object({
        hotelName: z.string().optional(),
        hotelAddress: z.string().optional(),
        checkIn: z.string().optional(),
        checkOut: z.string().optional(),
        bookingReference: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  bookingReferences: z.array(z.string()).optional().default([]),
});

export const itineraryScheduleItemSchema = z.object({
  time: z.string().optional(),
  activity: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
});

export const itineraryDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  date: z.string().optional(),
  theme: z.string().optional(),
  schedule: z.array(itineraryScheduleItemSchema).optional().default([]),
});

export const itineraryAccommodationSchema = z.object({
  hotelName: z.string().optional(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  notes: z.string().optional(),
});

export const itineraryContactSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
});

export const itinerarySchema = z.object({
  tripTitle: z.string().min(1),
  destination: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  summary: z.string().min(1),
  dayWiseItinerary: z.array(itineraryDaySchema).min(1),
  accommodationDetails: z.array(itineraryAccommodationSchema).optional().default([]),
  packingSuggestions: z.array(z.string()).optional().default([]),
  importantReminders: z.array(z.string()).optional().default([]),
  emergencyContacts: z.array(itineraryContactSchema).optional().default([]),
});

export type TravelData = z.infer<typeof travelDataSchema>;
export type ItineraryData = z.infer<typeof itinerarySchema>;

export const validateTravelData = (input: unknown): TravelData => {
  return travelDataSchema.parse(input);
};

export const validateItineraryData = (input: unknown): ItineraryData => {
  return itinerarySchema.parse(input);
};
