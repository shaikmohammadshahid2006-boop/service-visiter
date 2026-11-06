import mongoose from 'mongoose';
import { Notification, NotificationType } from '../models/Notification';

export interface CreateNotificationParams {
  recipientId: string | mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const notification = await Notification.create({
      recipient: params.recipientId,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link || '',
      metadata: params.metadata || {},
    });
    return notification;
  } catch (err) {
    console.error('[NotificationService] Error creating notification:', err);
    return null;
  }
};

