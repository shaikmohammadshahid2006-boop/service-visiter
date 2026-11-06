import mongoose, { Document, Schema } from 'mongoose';

export type AppointmentStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface IAppointment extends Document {
  bookingId: string;
  customer: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  appointmentDate: Date;
  timeSlot: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    landmark?: string;
  };
  description: string;
  estimatedCost: number;
  status: AppointmentStatus;
  statusHistory: Array<{
    status: AppointmentStatus;
    changedBy: mongoose.Types.ObjectId;
    note?: string;
    timestamp: Date;
  }>;
  cancellationReason?: string;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'ServiceCategory', required: true, index: true },
    appointmentDate: { type: Date, required: true, index: true },
    timeSlot: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      landmark: { type: String, default: '' },
    },
    description: { type: String, required: true },
    estimatedCost: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    cancellationReason: { type: String, default: '' },
    rejectedReason: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);

