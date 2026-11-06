import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'booking'
  | 'work_order'
  | 'scope_change'
  | 'completion'
  | 'dispute'
  | 'system';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['booking', 'work_order', 'scope_change', 'completion', 'dispute', 'system'],
      default: 'system',
      index: true,
    },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

