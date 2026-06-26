import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  name?: string;
  passwordHash?: string;
  auth0Id?: string;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    passwordHash: { type: String },
    auth0Id: { type: String, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  if (!this.passwordHash) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
