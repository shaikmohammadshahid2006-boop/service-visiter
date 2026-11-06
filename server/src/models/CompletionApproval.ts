import mongoose, { Document, Schema } from 'mongoose';

export type CompletionStatus = 'pending' | 'approved' | 'issue_reported';

export interface ICompletionApproval extends Document {
  completionRecordId: string;
  workOrder: mongoose.Types.ObjectId;
  bookingId: string;
  customer: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  originalScope: string;
  approvedScopeChanges: Array<{
    changeId: string;
    proposedScope: string;
    additionalCost: number;
    approvedAt: Date;
  }>;
  totalFinalCost: number;
  finalCompletionStatus: CompletionStatus;
  providerNotes: string;
  providerPhotos: {
    before: string[];
    after: string[];
  };
  providerCompletionTimestamp: Date;
  customerApprovalTimestamp?: Date;
  customerFeedback?: string;
  rating?: number;
  reportedIssueDetails?: string;
  reportedIssueTimestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CompletionApprovalSchema = new Schema<ICompletionApproval>(
  {
    completionRecordId: { type: String, required: true, unique: true, index: true },
    workOrder: { type: Schema.Types.ObjectId, ref: 'WorkOrder', required: true, unique: true, index: true },
    bookingId: { type: String, required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalScope: { type: String, required: true },
    approvedScopeChanges: [
      {
        changeId: { type: String, required: true },
        proposedScope: { type: String, required: true },
        additionalCost: { type: Number, default: 0 },
        approvedAt: { type: Date, default: Date.now },
      },
    ],
    totalFinalCost: { type: Number, required: true },
    finalCompletionStatus: {
      type: String,
      enum: ['pending', 'approved', 'issue_reported'],
      default: 'pending',
      index: true,
    },
    providerNotes: { type: String, default: '' },
    providerPhotos: {
      before: { type: [String], default: [] },
      after: { type: [String], default: [] },
    },
    providerCompletionTimestamp: { type: Date, required: true, default: Date.now },
    customerApprovalTimestamp: { type: Date },
    customerFeedback: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5 },
    reportedIssueDetails: { type: String, default: '' },
    reportedIssueTimestamp: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const CompletionApproval = mongoose.model<ICompletionApproval>('CompletionApproval', CompletionApprovalSchema);

