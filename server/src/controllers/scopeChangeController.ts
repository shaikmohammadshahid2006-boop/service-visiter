import { Response, NextFunction } from 'express';
import { ScopeChange } from '../models/ScopeChange';
import { WorkOrder } from '../models/WorkOrder';
import { generateScopeChangeId } from '../utils/idGenerator';
import { createNotification } from '../services/notificationService';
import { AuthRequest } from '../types';

export const createScopeChange = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { workOrderId, proposedScope, reason, additionalCost } = req.body;
    const workOrder = await WorkOrder.findById(workOrderId)
      .populate('customer', 'name email')
      .populate('provider', 'name email');

    if (!workOrder) {
      res.status(404).json({ success: false, message: 'Work order not found.' });
      return;
    }

    const isCustomer = workOrder.customer._id.toString() === req.user!.id;
    const isProvider = workOrder.provider._id.toString() === req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      res.status(403).json({ success: false, message: 'You are not authorized to request scope changes for this work order.' });
      return;
    }

    const requestedByRole = isCustomer ? 'customer' : 'provider';
    const recipientId = isCustomer ? workOrder.provider._id : workOrder.customer._id;
    const changeId = generateScopeChangeId();

    // Snapshot the original scope - NEVER modify workOrder.originalScope
    const scopeChange = await ScopeChange.create({
      changeId,
      workOrder: workOrder._id,
      bookingId: workOrder.bookingId,
      requestedBy: req.user!.id,
      requestedByRole,
      originalScopeSnapshot: workOrder.originalScope,
      proposedScope,
      reason,
      additionalCost: Number(additionalCost) || 0,
      status: 'pending',
    });

    // Notify the other party
    await createNotification({
      recipientId,
      title: 'New Scope Change Request',
      message: `${req.user!.name} (${requestedByRole}) requested a scope change for Work Order ${workOrder.workOrderId} (+$${additionalCost || 0}). Your approval is required.`,
      type: 'scope_change',
      link: isCustomer ? '/provider/scope-change-requests' : '/customer/scope-change-history',
      metadata: { scopeChangeId: scopeChange._id, workOrderId: workOrder._id },
    });

    // Record in work order history
    workOrder.workHistory.push({
      status: workOrder.status,
      note: `Scope change requested (${changeId}) by ${req.user!.name}: "${reason}" (+$${additionalCost || 0})`,
      updatedBy: req.user!.id as any,
      timestamp: new Date(),
    });
    await workOrder.save();

    const populated = await ScopeChange.findById(scopeChange._id)
      .populate('requestedBy', 'name role avatar')
      .populate('workOrder', 'workOrderId bookingId');

    res.status(201).json({
      success: true,
      message: 'Scope change request created successfully and awaiting approval.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getScopeChangesByWorkOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const scopeChanges = await ScopeChange.find({ workOrder: req.params.workOrderId })
      .populate('requestedBy', 'name role avatar')
      .populate('decidedBy', 'name role avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: scopeChanges.length, data: scopeChanges });
  } catch (error) {
    next(error);
  }
};

export const getAllScopeChanges = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = req.user!.role;
    const userId = req.user!.id;
    const { status } = req.query;

    let filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const scopeChanges = await ScopeChange.find(filter)
      .populate('requestedBy', 'name role avatar')
      .populate('decidedBy', 'name role avatar')
      .populate({
        path: 'workOrder',
        populate: [
          { path: 'customer', select: 'name email avatar' },
          { path: 'provider', select: 'name email avatar' },
        ],
      })
      .sort({ createdAt: -1 });

    // Filter relevant to user role if not admin
    let userScopeChanges = scopeChanges;
    if (role === 'customer') {
      userScopeChanges = scopeChanges.filter((sc: any) =>
        sc.workOrder && sc.workOrder.customer && sc.workOrder.customer._id.toString() === userId
      );
    } else if (role === 'provider') {
      userScopeChanges = scopeChanges.filter((sc: any) =>
        sc.workOrder && sc.workOrder.provider && sc.workOrder.provider._id.toString() === userId
      );
    }

    res.json({ success: true, count: userScopeChanges.length, data: userScopeChanges });
  } catch (error) {
    next(error);
  }
};

export const decideScopeChange = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { decision, decisionNotes } = req.body;
    const scopeChange = await ScopeChange.findById(req.params.id)
      .populate('requestedBy', 'name email role')
      .populate({
        path: 'workOrder',
        populate: [
          { path: 'customer', select: 'name email' },
          { path: 'provider', select: 'name email' },
        ],
      });

    if (!scopeChange) {
      res.status(404).json({ success: false, message: 'Scope change request not found.' });
      return;
    }

    if (scopeChange.status !== 'pending') {
      res.status(400).json({ success: false, message: `This scope change has already been ${scopeChange.status}.` });
      return;
    }

    const workOrder: any = scopeChange.workOrder;
    const isCustomer = workOrder.customer._id.toString() === req.user!.id;
    const isProvider = workOrder.provider._id.toString() === req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    // The requesting party cannot approve their own change request!
    if (scopeChange.requestedBy._id.toString() === req.user!.id && !isAdmin) {
      res.status(400).json({ success: false, message: 'You cannot approve or reject your own scope change request.' });
      return;
    }

    if (!isCustomer && !isProvider && !isAdmin) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    scopeChange.status = decision; // 'approved' | 'rejected'
    scopeChange.decidedBy = req.user!.id as any;
    scopeChange.decisionNotes = decisionNotes || '';
    scopeChange.decidedAt = new Date();
    await scopeChange.save();

    // If approved, update workOrder final cost (while keeping originalScope completely intact!)
    if (decision === 'approved') {
      workOrder.finalCost = (workOrder.finalCost || workOrder.estimatedCost) + (scopeChange.additionalCost || 0);
      workOrder.workHistory.push({
        status: workOrder.status,
        note: `Scope change ${scopeChange.changeId} APPROVED by ${req.user!.name}. Added $${scopeChange.additionalCost}. New total: $${workOrder.finalCost}`,
        updatedBy: req.user!.id as any,
        timestamp: new Date(),
      });
      await workOrder.save();
    } else {
      workOrder.workHistory.push({
        status: workOrder.status,
        note: `Scope change ${scopeChange.changeId} REJECTED by ${req.user!.name}.${decisionNotes ? ` Reason: ${decisionNotes}` : ''}`,
        updatedBy: req.user!.id as any,
        timestamp: new Date(),
      });
      await workOrder.save();
    }

    // Notify requester
    await createNotification({
      recipientId: scopeChange.requestedBy._id,
      title: `Scope Change Request ${decision.toUpperCase()}`,
      message: `${req.user!.name} has ${decision} your scope change request ${scopeChange.changeId}.${decisionNotes ? ` Note: ${decisionNotes}` : ''}`,
      type: 'scope_change',
      link: isCustomer ? '/customer/scope-change-history' : '/provider/scope-change-requests',
      metadata: { scopeChangeId: scopeChange._id, workOrderId: workOrder._id, decision },
    });

    res.json({
      success: true,
      message: `Scope change request has been ${decision}.`,
      data: scopeChange,
    });
  } catch (error) {
    next(error);
  }
};

