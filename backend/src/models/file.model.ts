import { Schema, model, Document, Types } from 'mongoose';

export interface IUploadedFile extends Document {
  userId: Types.ObjectId;
  tripId?: Types.ObjectId;
  filename: string;
  path: string; // Cloudinary URL
  mimetype: string;
  createdAt: Date;
  updatedAt: Date;
}

const UploadedFileSchema = new Schema<IUploadedFile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: false,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UploadedFile = model<IUploadedFile>('UploadedFile', UploadedFileSchema);
export default UploadedFile;
