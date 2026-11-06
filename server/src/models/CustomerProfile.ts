import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  landmark?: string;
}

export interface ICustomerProfile extends Document {
  user: mongoose.Types.ObjectId;
  address: IAddress;
  alternatePhone?: string;
  emergencyContact?: string;
  preferredContactMethod?: 'email' | 'phone' | 'in_app';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerProfileSchema = new Schema<ICustomerProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      landmark: { type: String, default: '' },
    },
    alternatePhone: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    preferredContactMethod: { type: String, enum: ['email', 'phone', 'in_app'], default: 'in_app' },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const CustomerProfile = mongoose.model<ICustomerProfile>('CustomerProfile', CustomerProfileSchema);

