import { Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { ProviderProfile } from '../models/ProviderProfile';
import { Appointment } from '../models/Appointment';
import { AuthRequest } from '../types';

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { appointmentId, rating, comment } = req.body;
    const customerId = req.user!.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    if (appointment.customer.toString() !== customerId) {
      res.status(403).json({ success: false, message: 'You can only review appointments you booked.' });
      return;
    }

    const existingReview = await Review.findOne({ appointment: appointmentId, customer: customerId });
    if (existingReview) {
      res.status(400).json({ success: false, message: 'You have already reviewed this service appointment.' });
      return;
    }

    const review = await Review.create({
      appointment: appointmentId,
      customer: customerId,
      provider: appointment.provider,
      rating: Number(rating),
      comment: comment || '',
    });

    // Update provider profile rating
    const allReviews = await Review.find({ provider: appointment.provider });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await ProviderProfile.findOneAndUpdate(
      { user: appointment.provider },
      {
        ratingAverage: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      }
    );

    res.status(201).json({ success: true, message: 'Review submitted successfully.', data: review });
  } catch (error) {
    next(error);
  }
};

export const getProviderReviews = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { providerId } = req.params;
    const reviews = await Review.find({ provider: providerId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

