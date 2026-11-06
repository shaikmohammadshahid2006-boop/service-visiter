import mongoose, { Document, Schema } from 'mongoose';

export type ScopeChangeStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type RequestedByRole = 'customer' | 'provider';

export interface IScopeChange extends Document {
  changeId: string;
  workOrder: mongoose.Types.ObjectId;
  bookingId: string;
  requestedBy: mongoose.Types.ObjectId;
  requestedByRole: RequestedByRole;
  originalScopeSnapshot: string;
  proposedScope: string;
  reason: string;
  additionalCost: number;
  status: ScopeChangeStatus;
  decidedBy?: mongoose.Types.ObjectId;
  decisionNotes?: string;
  decidedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScopeChangeSchema = new Schema<IScopeChange>(
  {
    changeId: { type: String, required: true, unique: true, index: true },
    workOrder: { type: Schema.Types.ObjectId, ref: 'WorkOrder', required: true, index: true },
    bookingId: { type: String, required: true, index: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requestedByRole: { type: String, enum: ['customer', 'provider'], required: true },
    originalScopeSnapshot: { type: String, required: true },
    proposedScope: { type: String, required: true },
    reason: { type: String, required: true },
    additionalCost: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    decidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    decisionNotes: { type: String, default: '' },
    decidedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const ScopeChange = mongoose.model<IScopeChange>('ScopeChange', ScopeChangeSchema);

