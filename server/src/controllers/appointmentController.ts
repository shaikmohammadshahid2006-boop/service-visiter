import { Response, NextFunction } from 'express';
import { Appointment, AppointmentStatus } from '../models/Appointment';
import { WorkOrder } from '../models/WorkOrder';
import { ServiceCategory } from '../models/ServiceCategory';
import { User } from '../models/User';
import { generateBookingId, generateWorkOrderId } from '../utils/idGenerator';
import { createNotification } from '../services/notificationService';
import { AuthRequest } from '../types';

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customerId = req.user!.id;
    const { providerId, categoryId, appointmentDate, timeSlot, address, description, estimatedCost } = req.body;

    const provider = await User.findOne({ _id: providerId, role: 'provider', status: 'active' });
    if (!provider) {
      res.status(404).json({ success: false, message: 'Selected provider was not found or is currently inactive.' });
      return;
    }

    const category = await ServiceCategory.findById(categoryId);
    if (!category) {
      res.status(404).json({ success: false, message: 'Service category not found.' });
      return;
    }

    const bookingId = generateBookingId();
    const finalEstimatedCost = Number(estimatedCost) > 0 ? Number(estimatedCost) : category.basePrice;

    const appointment = await Appointment.create({
      bookingId,
      customer: customerId,
      provider: providerId,
      category: categoryId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      address,
      description,
      estimatedCost: finalEstimatedCost,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedBy: customerId,
          note: 'Appointment requested by customer',
          timestamp: new Date(),
        },
      ],
    });

    // Notify provider
    await createNotification({
      recipientId: providerId,
      title: 'New Service Booking Request',
      message: `${req.user!.name} requested an appointment for ${category.name} on ${new Date(appointmentDate).toLocaleDateString()} (${timeSlot}).`,
      type: 'booking',
      link: '/provider/booking-requests',
      metadata: { bookingId, appointmentId: appointment._id },
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customer', 'name email phone avatar')
      .populate('provider', 'name email phone avatar')
      .populate('category');

    res.status(201).json({
      success: true,
      message: 'Appointment booking submitted successfully.',
      data: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id;
    const { status, search, date } = req.query;

    let filter: any = {};

    if (userRole === 'customer') {
      filter.customer = userId;
    } else if (userRole === 'provider') {
      filter.provider = userId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (date) {
      const d = new Date(date as string);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      filter.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    let appointments = await Appointment.find(filter)
      .populate('customer', 'name email phone avatar')
      .populate('provider', 'name email phone avatar')
      .populate('category')
      .sort({ appointmentDate: -1, createdAt: -1 });

    if (search) {
      const q = (search as string).toLowerCase();
      appointments = appointments.filter((app: any) =>
        app.bookingId.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        (app.category && app.category.name.toLowerCase().includes(q)) ||
        (app.customer && app.customer.name.toLowerCase().includes(q)) ||
        (app.provider && app.provider.name.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customer', 'name email phone avatar')
      .populate('provider', 'name email phone avatar')
      .populate('category');

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    // Authorization check
    if (
      req.user!.role !== 'admin' &&
      appointment.customer._id.toString() !== req.user!.id &&
      appointment.provider._id.toString() !== req.user!.id
    ) {
      res.status(403).json({ success: false, message: 'Access denied to this appointment.' });
      return;
    }

    // Check if work order exists for this appointment
    const workOrder = await WorkOrder.findOne({ appointment: appointment._id });

    res.json({
      success: true,
      data: {
        ...appointment.toObject(),
        workOrder: workOrder || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, note, rejectionReason, cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('provider', 'name email');

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    // Check permissions
    const isCustomer = appointment.customer._id.toString() === req.user!.id;
    const isProvider = appointment.provider._id.toString() === req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const prevStatus = appointment.status;
    appointment.status = status as AppointmentStatus;

    if (rejectionReason) appointment.rejectedReason = rejectionReason;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;

    appointment.statusHistory.push({
      status: status as AppointmentStatus,
      changedBy: req.user!.id as any,
      note: note || `Status changed from ${prevStatus} to ${status} by ${req.user!.name}`,
      timestamp: new Date(),
    });

    await appointment.save();

    let generatedWorkOrder: any = null;

    // MODULE 3: When accepted, automatically generate a Work Order
    if (status === 'accepted' || status === 'scheduled') {
      let existingWO = await WorkOrder.findOne({ appointment: appointment._id });
      if (!existingWO) {
        const workOrderId = generateWorkOrderId();
        existingWO = await WorkOrder.create({
          workOrderId,
          bookingId: appointment.bookingId,
          appointment: appointment._id,
          customer: appointment.customer._id,
          provider: appointment.provider._id,
          originalScope: appointment.description,
          estimatedCost: appointment.estimatedCost,
          finalCost: appointment.estimatedCost,
          scheduledDate: appointment.appointmentDate,
          timeSlot: appointment.timeSlot,
          status: 'created',
          workHistory: [
            {
              status: 'created',
              note: `Work order generated upon appointment acceptance by ${req.user!.name}`,
              updatedBy: req.user!.id as any,
              timestamp: new Date(),
            },
          ],
        });
        generatedWorkOrder = existingWO;
      }
    }

    // Notifications
    if (isProvider) {
      await createNotification({
        recipientId: appointment.customer._id,
        title: `Appointment ${status.toUpperCase()}`,
        message: `Provider ${req.user!.name} has marked your appointment (${appointment.bookingId}) as ${status}.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
        type: 'booking',
        link: '/customer/my-appointments',
      });
    } else if (isCustomer && status === 'cancelled') {
      await createNotification({
        recipientId: appointment.provider._id,
        title: 'Appointment Cancelled',
        message: `Customer ${req.user!.name} cancelled booking ${appointment.bookingId}.${cancellationReason ? ` Reason: ${cancellationReason}` : ''}`,
        type: 'booking',
        link: '/provider/my-appointments',
      });
    }

    res.json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      data: appointment,
      workOrder: generatedWorkOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    // Cancel instead of hard deleting to preserve audit history unless admin
    if (req.user!.role === 'admin') {
      await Appointment.findByIdAndDelete(req.params.id);
      await WorkOrder.findOneAndDelete({ appointment: req.params.id });
      res.json({ success: true, message: 'Appointment permanently removed by admin.' });
      return;
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = 'Cancelled by user';
    appointment.statusHistory.push({
      status: 'cancelled',
      changedBy: req.user!.id as any,
      note: 'Appointment cancelled',
      timestamp: new Date(),
    });
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled successfully.', data: appointment });
  } catch (error) {
    next(error);
  }
};

