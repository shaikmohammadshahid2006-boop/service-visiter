import mongoose, { Document, Schema } from 'mongoose';

export type WorkOrderStatus = 'created' | 'in_progress' | 'completed' | 'cancelled';

export interface IWorkOrderHistory {
  status: string;
  note: string;
  updatedBy: mongoose.Types.ObjectId;
  timestamp: Date;
}

export interface IWorkOrder extends Document {
  workOrderId: string;
  bookingId: string;
  appointment: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  originalScope: string;
  estimatedCost: number;
  finalCost: number;
  scheduledDate: Date;
  timeSlot: string;
  status: WorkOrderStatus;
  workHistory: IWorkOrderHistory[];
  beforePhotos: string[];
  afterPhotos: string[];
  providerCompletionNotes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkOrderSchema = new Schema<IWorkOrder>(
  {
    workOrderId: { type: String, required: true, unique: true, index: true },
    bookingId: { type: String, required: true, index: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalScope: { type: String, required: true },
    estimatedCost: { type: Number, required: true },
    finalCost: { type: Number, required: true },
    scheduledDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ['created', 'in_progress', 'completed', 'cancelled'],
      default: 'created',
      index: true,
    },
    workHistory: [
      {
        status: { type: String, required: true },
        note: { type: String, default: '' },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    beforePhotos: { type: [String], default: [] },
    afterPhotos: { type: [String], default: [] },
    providerCompletionNotes: { type: String, default: '' },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const WorkOrder = mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema);

