import { Response, NextFunction } from 'express';
import { Dispute, DisputeStatus } from '../models/Dispute';
import { WorkOrder } from '../models/WorkOrder';
import { Appointment } from '../models/Appointment';
import { User } from '../models/User';
import { generateDisputeId } from '../utils/idGenerator';
import { createNotification } from '../services/notificationService';
import { AuthRequest } from '../types';

export const createDispute = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { workOrderId, appointmentId, reason, title, description, desiredResolution } = req.body;
    const userId = req.user!.id;

    let targetWorkOrder = null;
    let targetAppointment = null;
    let againstUserId: any = null;
    let bookingId = '';

    if (workOrderId) {
      targetWorkOrder = await WorkOrder.findById(workOrderId)
        .populate('customer', 'name email')
        .populate('provider', 'name email');
      if (targetWorkOrder) {
        bookingId = targetWorkOrder.bookingId;
        againstUserId = targetWorkOrder.customer._id.toString() === userId
          ? targetWorkOrder.provider._id
          : targetWorkOrder.customer._id;
      }
    }

    if (!targetWorkOrder && appointmentId) {
      targetAppointment = await Appointment.findById(appointmentId)
        .populate('customer', 'name email')
        .populate('provider', 'name email');
      if (targetAppointment) {
        bookingId = targetAppointment.bookingId;
        againstUserId = targetAppointment.customer._id.toString() === userId
          ? targetAppointment.provider._id
          : targetAppointment.customer._id;
      }
    }

    if (!againstUserId) {
      res.status(400).json({ success: false, message: 'Could not determine the opposing party for this dispute.' });
      return;
    }

    const disputeId = generateDisputeId();

    const dispute = await Dispute.create({
      disputeId,
      workOrder: targetWorkOrder?._id,
      appointment: targetAppointment?._id || targetWorkOrder?.appointment,
      bookingId,
      raisedBy: userId,
      againstUser: againstUserId,
      reason,
      title,
      description,
      desiredResolution: desiredResolution || '',
      status: 'opened',
      messages: [
        {
          sender: userId as any,
          senderRole: req.user!.role,
          message: description,
          timestamp: new Date(),
        },
      ],
    });

    // Notify opposing party
    await createNotification({
      recipientId: againstUserId,
      title: 'Dispute Raised Regarding Service',
      message: `${req.user!.name} raised a dispute (${disputeId}): "${title}". Please review and provide your response.`,
      type: 'dispute',
      link: req.user!.role === 'customer' ? '/provider/disputes' : '/customer/disputes',
      metadata: { disputeId: dispute._id },
    });

    // Notify all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        recipientId: admin._id,
        title: 'New Dispute Requires Review',
        message: `Dispute ${disputeId} raised by ${req.user!.name}: "${title}". Reason: ${reason}.`,
        type: 'dispute',
        link: '/admin/disputes',
        metadata: { disputeId: dispute._id },
      });
    }

    const populatedDispute = await Dispute.findById(dispute._id)
      .populate('raisedBy', 'name email avatar role')
      .populate('againstUser', 'name email avatar role');

    res.status(201).json({
      success: true,
      message: 'Dispute filed successfully. Support and opposing party have been notified.',
      data: populatedDispute,
    });
  } catch (error) {
    next(error);
  }
};

export const getDisputes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = req.user!.role;
    const userId = req.user!.id;
    const { status, search } = req.query;

    let filter: any = {};

    if (role !== 'admin') {
      filter.$or = [{ raisedBy: userId }, { againstUser: userId }];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    let disputes = await Dispute.find(filter)
      .populate('raisedBy', 'name email avatar role')
      .populate('againstUser', 'name email avatar role')
      .populate({
        path: 'workOrder',
        select: 'workOrderId bookingId originalScope finalCost status',
      })
      .sort({ createdAt: -1 });

    if (search) {
      const q = (search as string).toLowerCase();
      disputes = disputes.filter((d: any) =>
        d.disputeId.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.bookingId.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: disputes.length, data: disputes });
  } catch (error) {
    next(error);
  }
};

export const getDisputeById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('raisedBy', 'name email avatar role')
      .populate('againstUser', 'name email avatar role')
      .populate('messages.sender', 'name email avatar role')
      .populate('workOrder')
      .populate('appointment');

    if (!dispute) {
      res.status(404).json({ success: false, message: 'Dispute not found.' });
      return;
    }

    if (
      req.user!.role !== 'admin' &&
      dispute.raisedBy._id.toString() !== req.user!.id &&
      dispute.againstUser._id.toString() !== req.user!.id
    ) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.json({ success: true, data: dispute });
  } catch (error) {
    next(error);
  }
};

export const addDisputeMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message, attachments } = req.body;
    const dispute = await Dispute.findById(req.params.id)
      .populate('raisedBy', 'name email role')
      .populate('againstUser', 'name email role');

    if (!dispute) {
      res.status(404).json({ success: false, message: 'Dispute not found.' });
      return;
    }

    const isParticipant =
      dispute.raisedBy._id.toString() === req.user!.id ||
      dispute.againstUser._id.toString() === req.user!.id ||
      req.user!.role === 'admin';

    if (!isParticipant) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    dispute.messages.push({
      sender: req.user!.id as any,
      senderRole: req.user!.role,
      message,
      attachments: attachments || [],
      timestamp: new Date(),
    });

    if (dispute.status === 'opened' && req.user!.role === 'admin') {
      dispute.status = 'under_review';
    }

    await dispute.save();

    // Determine whom to notify
    const otherUserId = dispute.raisedBy._id.toString() === req.user!.id
      ? dispute.againstUser._id
      : dispute.raisedBy._id;

    await createNotification({
      recipientId: otherUserId,
      title: 'New Message in Dispute',
      message: `${req.user!.name} posted a new response to dispute ${dispute.disputeId}.`,
      type: 'dispute',
      link: `/disputes/${dispute._id}`,
      metadata: { disputeId: dispute._id },
    });

    const populated = await Dispute.findById(dispute._id)
      .populate('raisedBy', 'name email avatar role')
      .populate('againstUser', 'name email avatar role')
      .populate('messages.sender', 'name email avatar role');

    res.json({ success: true, message: 'Message sent successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

export const updateDispute = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, adminNotes, resolutionSummary } = req.body;
    const dispute = await Dispute.findById(req.params.id)
      .populate('raisedBy', 'name email')
      .populate('againstUser', 'name email');

    if (!dispute) {
      res.status(404).json({ success: false, message: 'Dispute not found.' });
      return;
    }

    if (req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only administrators can resolve or update dispute status.' });
      return;
    }

    if (status) dispute.status = status as DisputeStatus;
    if (adminNotes !== undefined) dispute.adminNotes = adminNotes;
    if (resolutionSummary !== undefined) dispute.resolutionSummary = resolutionSummary;

    if (status === 'resolved' || status === 'rejected') {
      dispute.resolvedAt = new Date();
      dispute.resolvedBy = req.user!.id as any;
    }

    await dispute.save();

    // Notify both customer and provider
    await createNotification({
      recipientId: dispute.raisedBy._id,
      title: `Dispute ${status?.toUpperCase() || 'UPDATED'}`,
      message: `Admin ${req.user!.name} updated dispute ${dispute.disputeId} to ${status}.${resolutionSummary ? ` Summary: ${resolutionSummary}` : ''}`,
      type: 'dispute',
      link: '/customer/disputes',
      metadata: { disputeId: dispute._id },
    });

    await createNotification({
      recipientId: dispute.againstUser._id,
      title: `Dispute ${status?.toUpperCase() || 'UPDATED'}`,
      message: `Admin ${req.user!.name} updated dispute ${dispute.disputeId} to ${status}.${resolutionSummary ? ` Summary: ${resolutionSummary}` : ''}`,
      type: 'dispute',
      link: '/provider/disputes',
      metadata: { disputeId: dispute._id },
    });

    res.json({ success: true, message: 'Dispute updated successfully.', data: dispute });
  } catch (error) {
    next(error);
  }
};

