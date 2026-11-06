import mongoose, { Document, Schema } from 'mongoose';

export interface IAvailability {
  days: string[]; // e.g. ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  startTime: string; // e.g. '08:00'
  endTime: string; // e.g. '18:00'
  isAcceptingBookings: boolean;
}

export interface IProviderProfile extends Document {
  user: mongoose.Types.ObjectId;
  businessName: string;
  bio: string;
  categories: mongoose.Types.ObjectId[];
  experienceYears: number;
  hourlyRate: number;
  ratingAverage: number;
  reviewCount: number;
  serviceRadiusMiles: number;
  availability: IAvailability;
  isVerified: boolean;
  licenseNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderProfileSchema = new Schema<IProviderProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    businessName: { type: String, required: true, trim: true },
    bio: { type: String, default: '' },
    categories: [{ type: Schema.Types.ObjectId, ref: 'ServiceCategory' }],
    experienceYears: { type: Number, default: 1 },
    hourlyRate: { type: Number, default: 50 },
    ratingAverage: { type: Number, default: 5.0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    serviceRadiusMiles: { type: Number, default: 25 },
    availability: {
      days: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
      startTime: { type: String, default: '08:00' },
      endTime: { type: String, default: '18:00' },
      isAcceptingBookings: { type: Boolean, default: true },
    },
    isVerified: { type: Boolean, default: true },
    licenseNumber: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const ProviderProfile = mongoose.model<IProviderProfile>('ProviderProfile', ProviderProfileSchema);

