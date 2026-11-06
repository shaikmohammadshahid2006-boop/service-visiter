import mongoose, { Document, Schema } from 'mongoose';

export type DisputeReason =
  | 'incomplete_work'
  | 'incorrect_work'
  | 'unauthorized_charges'
  | 'missed_appointment'
  | 'scope_disagreement'
  | 'other';

export type DisputeStatus = 'opened' | 'under_review' | 'resolved' | 'rejected';

export interface IDisputeMessage {
  sender: mongoose.Types.ObjectId;
  senderRole: 'customer' | 'provider' | 'admin';
  message: string;
  attachments?: string[];
  timestamp: Date;
}

export interface IDispute extends Document {
  disputeId: string;
  workOrder?: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  bookingId?: string;
  raisedBy: mongoose.Types.ObjectId;
  againstUser: mongoose.Types.ObjectId;
  reason: DisputeReason;
  title: string;
  description: string;
  desiredResolution: string;
  status: DisputeStatus;
  messages: IDisputeMessage[];
  adminNotes?: string;
  resolutionSummary?: string;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    disputeId: { type: String, required: true, unique: true, index: true },
    workOrder: { type: Schema.Types.ObjectId, ref: 'WorkOrder', index: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment', index: true },
    bookingId: { type: String, default: '' },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    againstUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: {
      type: String,
      enum: [
        'incomplete_work',
        'incorrect_work',
        'unauthorized_charges',
        'missed_appointment',
        'scope_disagreement',
        'other',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    desiredResolution: { type: String, default: '' },
    status: {
      type: String,
      enum: ['opened', 'under_review', 'resolved', 'rejected'],
      default: 'opened',
      index: true,
    },
    messages: [
      {
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        senderRole: { type: String, enum: ['customer', 'provider', 'admin'], required: true },
        message: { type: String, required: true },
        attachments: { type: [String], default: [] },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    adminNotes: { type: String, default: '' },
    resolutionSummary: { type: String, default: '' },
    resolvedAt: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);

