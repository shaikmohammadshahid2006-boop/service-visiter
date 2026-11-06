import { Response, NextFunction } from 'express';
import { WorkOrder, WorkOrderStatus } from '../models/WorkOrder';
import { ScopeChange } from '../models/ScopeChange';
import { CompletionApproval } from '../models/CompletionApproval';
import { createNotification } from '../services/notificationService';
import { AuthRequest } from '../types';

export const getWorkOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = req.user!.role;
    const userId = req.user!.id;
    const { status, search } = req.query;

    let filter: any = {};
    if (role === 'customer') {
      filter.customer = userId;
    } else if (role === 'provider') {
      filter.provider = userId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    let workOrders = await WorkOrder.find(filter)
      .populate('customer', 'name email phone avatar')
      .populate('provider', 'name email phone avatar')
      .populate({
        path: 'appointment',
        populate: { path: 'category' },
      })
      .sort({ createdAt: -1 });

    if (search) {
      const q = (search as string).toLowerCase();
      workOrders = workOrders.filter((wo: any) =>
        wo.workOrderId.toLowerCase().includes(q) ||
        wo.bookingId.toLowerCase().includes(q) ||
        wo.originalScope.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: workOrders.length, data: workOrders });
  } catch (error) {
    next(error);
  }
};

export const getWorkOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('customer', 'name email phone avatar')
      .populate('provider', 'name email phone avatar')
      .populate({
        path: 'appointment',
        populate: { path: 'category' },
      });

    if (!workOrder) {
      res.status(404).json({ success: false, message: 'Work order not found.' });
      return;
    }

    // Role check
    if (
      req.user!.role !== 'admin' &&
      workOrder.customer._id.toString() !== req.user!.id &&
      workOrder.provider._id.toString() !== req.user!.id
    ) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    // Fetch related scope changes
    const scopeChanges = await ScopeChange.find({ workOrder: workOrder._id })
      .populate('requestedBy', 'name role avatar')
      .populate('decidedBy', 'name role')
      .sort({ createdAt: -1 });

    // Fetch completion approval record if any
    const completionRecord = await CompletionApproval.findOne({ workOrder: workOrder._id });

    res.json({
      success: true,
      data: {
        ...workOrder.toObject(),
        scopeChanges,
        completionRecord,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, note, beforePhotos, afterPhotos, providerCompletionNotes } = req.body;
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('provider', 'name email');

    if (!workOrder) {
      res.status(404).json({ success: false, message: 'Work order not found.' });
      return;
    }

    if (req.user!.role !== 'admin' && workOrder.provider._id.toString() !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Only the assigned provider or admin can update work order status.' });
      return;
    }

    if (status) workOrder.status = status as WorkOrderStatus;
    if (beforePhotos && Array.isArray(beforePhotos)) workOrder.beforePhotos = beforePhotos;
    if (afterPhotos && Array.isArray(afterPhotos)) workOrder.afterPhotos = afterPhotos;
    if (providerCompletionNotes) workOrder.providerCompletionNotes = providerCompletionNotes;

    workOrder.workHistory.push({
      status: status || workOrder.status,
      note: note || `Work status updated to ${status} by ${req.user!.name}`,
      updatedBy: req.user!.id as any,
      timestamp: new Date(),
    });

    await workOrder.save();

    // Notify customer
    await createNotification({
      recipientId: workOrder.customer._id,
      title: 'Work Order Updated',
      message: `Your work order ${workOrder.workOrderId} was updated to '${workOrder.status}' by ${req.user!.name}.${note ? ` Note: ${note}` : ''}`,
      type: 'work_order',
      link: '/customer/work-orders',
      metadata: { workOrderId: workOrder._id },
    });

    res.json({ success: true, message: 'Work order updated successfully.', data: workOrder });
  } catch (error) {
    next(error);
  }
};

