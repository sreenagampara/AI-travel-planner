import { z } from 'zod';

export const generateItinerarySchema = z.object({
  fileIds: z.array(z.string().uuid().or(z.string().length(24))).min(1, {
    message: 'At least one file ID is required to generate an itinerary.',
  }),
});

export const updateTripSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  isPublic: z.boolean().optional(),
});

export type GenerateItineraryInput = z.infer<typeof generateItinerarySchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
