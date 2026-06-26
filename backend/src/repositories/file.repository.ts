import { UploadedFile, IUploadedFile } from '../models/file.model';
import { Types } from 'mongoose';

export class FileRepository {
  async create(fileData: Partial<IUploadedFile>): Promise<IUploadedFile> {
    const newFile = new UploadedFile(fileData);
    return newFile.save();
  }

  async findByTripId(tripId: string | Types.ObjectId): Promise<IUploadedFile[]> {
    const tripObjId = typeof tripId === 'string' ? new Types.ObjectId(tripId) : tripId;
    return UploadedFile.find({ tripId: tripObjId }).exec();
  }

  async findByUserId(userId: string | Types.ObjectId): Promise<IUploadedFile[]> {
    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return UploadedFile.find({ userId: userObjId }).sort({ createdAt: -1 }).exec();
  }

  async linkFilesToTrip(fileIds: string[], tripId: string | Types.ObjectId): Promise<void> {
    const tripObjId = typeof tripId === 'string' ? new Types.ObjectId(tripId) : tripId;
    const fileObjIds = fileIds.map((id) => new Types.ObjectId(id));

    await UploadedFile.updateMany(
      { _id: { $in: fileObjIds } },
      { $set: { tripId: tripObjId } }
    ).exec();
  }

  async countByUserId(userId: string | Types.ObjectId): Promise<number> {
    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return UploadedFile.countDocuments({ userId: userObjId }).exec();
  }
}

export default FileRepository;
