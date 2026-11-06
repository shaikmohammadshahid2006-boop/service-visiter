import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  appointment: mongoose.Types.ObjectId;
  workOrder?: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
    workOrder: { type: Schema.Types.ObjectId, ref: 'WorkOrder', index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.model<IReview>('Review', ReviewSchema);

