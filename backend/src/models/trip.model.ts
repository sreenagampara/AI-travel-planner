import { Schema, model, Document, Types } from 'mongoose';

export interface ITrip extends Document {
  title: string;
  userId: Types.ObjectId;
  itinerary: Record<string, any>;
  travelData: Record<string, any>;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itinerary: {
      type: Schema.Types.Mixed,
      required: true,
    },
    travelData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Trip = model<ITrip>('Trip', TripSchema);
export default Trip;
