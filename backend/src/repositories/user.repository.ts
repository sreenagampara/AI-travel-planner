import { User, IUser } from '../models/user.model';
import { Types } from 'mongoose';

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return User.findById(id).exec();
  }

  async findByAuth0Id(auth0Id: string): Promise<IUser | null> {
    return User.findOne({ auth0Id }).exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const newUser = new User(userData);
    return newUser.save();
  }

  async update(auth0Id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findOneAndUpdate({ auth0Id }, updateData, { new: true }).exec();
  }
}

export default UserRepository;
