import { Response, NextFunction } from 'express';
import { WorkOrder } from '../models/WorkOrder';
import { Appointment } from '../models/Appointment';
import { ScopeChange } from '../models/ScopeChange';
import { CompletionApproval } from '../models/CompletionApproval';
import { Review } from '../models/Review';
import { ProviderProfile } from '../models/ProviderProfile';
import { generateCompletionId } from '../utils/idGenerator';
import { createNotification } from '../services/notificationService';
import { AuthRequest } from '../types';

export const requestCompletion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { workOrderId } = req.params;
    const { providerNotes, beforePhotos, afterPhotos } = req.body;

    const workOrder = await WorkOrder.findById(workOrderId)
      .populate('customer', 'name email')
      .populate('provider', 'name email');

    if (!workOrder) {
      res.status(404).json({ success: false, message: 'Work order not found.' });
      return;
    }

    // Must be the assigned provider or admin
    if (req.user!.role !== 'admin' && workOrder.provider._id.toString() !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Only the assigned provider can request completion sign-off.' });
      return;
    }

    // Find all approved scope changes for this work order
    const approvedScopeChangesDocs = await ScopeChange.find({
      workOrder: workOrder._id,
      status: 'approved',
    });

    const approvedScopeChanges = approvedScopeChangesDocs.map((sc) => ({
      changeId: sc.changeId,
      proposedScope: sc.proposedScope,
      additionalCost: sc.additionalCost,
      approvedAt: sc.decidedAt || sc.updatedAt,
    }));

    // Update work order photos and completion notes
    workOrder.status = 'completed';
    workOrder.completedAt = new Date();
    if (beforePhotos && Array.isArray(beforePhotos)) workOrder.beforePhotos = beforePhotos;
    if (afterPhotos && Array.isArray(afterPhotos)) workOrder.afterPhotos = afterPhotos;
    if (providerNotes) workOrder.providerCompletionNotes = providerNotes;

    workOrder.workHistory.push({
      status: 'completed',
      note: `Job completed by provider ${req.user!.name}. Customer sign-off requested.`,
      updatedBy: req.user!.id as any,
      timestamp: new Date(),
    });
    await workOrder.save();

    // Generate or update completion record
    let completionRecord = await CompletionApproval.findOne({ workOrder: workOrder._id });
    if (!completionRecord) {
      const completionRecordId = generateCompletionId();
      completionRecord = await CompletionApproval.create({
        completionRecordId,
        workOrder: workOrder._id,
        bookingId: workOrder.bookingId,
        customer: workOrder.customer._id,
        provider: workOrder.provider._id,
        originalScope: workOrder.originalScope,
        approvedScopeChanges,
        totalFinalCost: workOrder.finalCost,
        finalCompletionStatus: 'pending',
        providerNotes: providerNotes || '',
        providerPhotos: {
          before: beforePhotos || [],
          after: afterPhotos || [],
        },
        providerCompletionTimestamp: new Date(),
      });
    } else {
      completionRecord.providerNotes = providerNotes || completionRecord.providerNotes;
      completionRecord.providerPhotos = {
        before: beforePhotos || completionRecord.providerPhotos.before,
        after: afterPhotos || completionRecord.providerPhotos.after,
      };
      completionRecord.providerCompletionTimestamp = new Date();
      completionRecord.finalCompletionStatus = 'pending';
      completionRecord.approvedScopeChanges = approvedScopeChanges;
      completionRecord.totalFinalCost = workOrder.finalCost;
      await completionRecord.save();
    }

    // Notify customer
    await createNotification({
      recipientId: workOrder.customer._id,
      title: 'Service Completion Confirmation Needed',
      message: `${req.user!.name} has marked work order ${workOrder.workOrderId} as complete. Please review the work and provide your sign-off.`,
      type: 'completion',
      link: '/customer/completion-approvals',
      metadata: { workOrderId: workOrder._id, completionRecordId: completionRecord.completionRecordId },
    });

    res.json({
      success: true,
      message: 'Work completion submitted. Customer sign-off notification sent.',
      data: completionRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const approveCompletion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { workOrderId } = req.params;
    const { customerFeedback, rating } = req.body;

    const workOrder = await WorkOrder.findById(workOrderId)
      .populate('customer', 'name email')
      .populate('provider', 'name email');

    if (!workOrder) {
      res.status(404).json({ success: false, message: 'Work order not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && workOrder.customer._id.toString() !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Only the customer can approve completion sign-off.' });
      return;
    }

    let completionRecord = await CompletionApproval.findOne({ workOrder: workOrder._id });
    if (!completionRecord) {
      res.status(404).json({ success: false, message: 'Completion record not found for this work order.' });
      return;
    }

    completionRecord.finalCompletionStatus = 'approved';
    completionRecord.customerApprovalTimestamp = new Date();
    completionRecord.customerFeedback = customerFeedback || 'Work completed satisfactorily.';
    completionRecord.rating = Number(rating) || 5;
    await completionRecord.save();

    // Mark appointment as fully completed
    await Appointment.findByIdAndUpdate(workOrder.appointment, {
      status: 'completed',
      $push: {
        statusHistory: {
          status: 'completed',
          changedBy: req.user!.id,
          note: `Customer approved completion sign-off with ${rating || 5}-star rating`,
          timestamp: new Date(),
        },
      },
    });

    // Record in work order history
    workOrder.workHistory.push({
      status: 'customer_signed_off',
      note: `Customer approved work completion. Rating: ${rating || 5}/5. Feedback: "${customerFeedback || ''}"`,
      updatedBy: req.user!.id as any,
      timestamp: new Date(),
    });
    await workOrder.save();

    // Create review record
    await Review.create({
      appointment: workOrder.appointment,
      workOrder: workOrder._id,
      customer: workOrder.customer._id,
      provider: workOrder.provider._id,
      rating: Number(rating) || 5,
      comment: customerFeedback || 'Work completed satisfactorily.',
    });

    // Update provider profile rating stats
    const allProviderReviews = await Review.find({ provider: workOrder.provider._id });
    const totalRating = allProviderReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = allProviderReviews.length > 0 ? (totalRating / allProviderReviews.length) : 5.0;

    await ProviderProfile.findOneAndUpdate(
      { user: workOrder.provider._id },
      {
        ratingAverage: Math.round(avgRating * 10) / 10,
        reviewCount: allProviderReviews.length,
      }
    );

    // Notify provider
    await createNotification({
      recipientId: workOrder.provider._id,
      title: 'Customer Approved Job Sign-Off!',
      message: `${req.user!.name} approved completion for ${workOrder.workOrderId} with a ${rating || 5}-star review!`,
      type: 'completion',
      link: '/provider/completed-jobs',
      metadata: { workOrderId: workOrder._id, rating },
    });

    res.json({
      success: true,
      message: 'Work order completion signed off successfully. Thank you for your feedback!',
      data: completionRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const reportIssueCompletion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { workOrderId } = req.params;
    const { reportedIssueDetails } = req.body;

    const workOrder = await WorkOrder.findById(workOrderId)
      .populate('customer', 'name email')
      .populate('provider', 'name email');

    if (!workOrder) {
      res.status(404).json({ success: false, message: 'Work order not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && workOrder.customer._id.toString() !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Only the customer can report completion issues.' });
      return;
    }

    let completionRecord = await CompletionApproval.findOne({ workOrder: workOrder._id });
    if (!completionRecord) {
      res.status(404).json({ success: false, message: 'Completion record not found.' });
      return;
    }

    completionRecord.finalCompletionStatus = 'issue_reported';
    completionRecord.reportedIssueDetails = reportedIssueDetails;
    completionRecord.reportedIssueTimestamp = new Date();
    await completionRecord.save();

    // Revert work order status to in_progress or flagged
    workOrder.status = 'in_progress';
    workOrder.workHistory.push({
      status: 'issue_reported',
      note: `Customer reported issue upon completion review: "${reportedIssueDetails}"`,
      updatedBy: req.user!.id as any,
      timestamp: new Date(),
    });
    await workOrder.save();

    // Notify provider
    await createNotification({
      recipientId: workOrder.provider._id,
      title: 'Issue Reported on Completed Job',
      message: `Customer ${req.user!.name} reported an issue regarding ${workOrder.workOrderId}: "${reportedIssueDetails}". Please review and resolve.`,
      type: 'completion',
      link: '/provider/work-orders',
      metadata: { workOrderId: workOrder._id, issue: reportedIssueDetails },
    });

    res.json({
      success: true,
      message: 'Issue reported to service provider. Work order returned to active status for resolution.',
      data: completionRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompletionApprovals = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = req.user!.role;
    const userId = req.user!.id;
    const { status } = req.query;

    let filter: any = {};
    if (role === 'customer') {
      filter.customer = userId;
    } else if (role === 'provider') {
      filter.provider = userId;
    }

    if (status && status !== 'all') {
      filter.finalCompletionStatus = status;
    }

    const records = await CompletionApproval.find(filter)
      .populate('customer', 'name email avatar phone')
      .populate('provider', 'name email avatar phone')
      .populate({
        path: 'workOrder',
        populate: { path: 'appointment', populate: { path: 'category' } },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

