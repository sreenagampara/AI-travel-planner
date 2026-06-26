import { Trip, ITrip } from '../models/trip.model';
import { Types } from 'mongoose';

export class TripRepository {
  async findById(id: string): Promise<ITrip | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Trip.findById(id).exec();
  }

  async findByUserId(userId: string | Types.ObjectId): Promise<ITrip[]> {
    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return Trip.find({ userId: userObjId }).sort({ createdAt: -1 }).exec();
  }

  async create(tripData: Partial<ITrip>): Promise<ITrip> {
    const newTrip = new Trip(tripData);
    return newTrip.save();
  }

  async update(id: string, updateData: Partial<ITrip>): Promise<ITrip | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Trip.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string): Promise<ITrip | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Trip.findByIdAndDelete(id).exec();
  }

  async countByUserId(userId: string | Types.ObjectId): Promise<number> {
    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return Trip.countDocuments({ userId: userObjId }).exec();
  }
}

export default TripRepository;
