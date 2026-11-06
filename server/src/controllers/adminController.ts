import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import { WorkOrder } from '../models/WorkOrder';
import { ScopeChange } from '../models/ScopeChange';
import { Dispute } from '../models/Dispute';
import { ServiceCategory } from '../models/ServiceCategory';
import { ProviderProfile } from '../models/ProviderProfile';
import { CustomerProfile } from '../models/CustomerProfile';
import { AuthRequest } from '../types';

export const getAdminStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalCustomers,
      totalProviders,
      totalAppointments,
      pendingBookings,
      completedAppointments,
      cancelledAppointments,
      totalWorkOrders,
      activeWorkOrders,
      pendingScopeChanges,
      activeDisputes,
      totalCategories,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'provider' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      WorkOrder.countDocuments(),
      WorkOrder.countDocuments({ status: 'in_progress' }),
      ScopeChange.countDocuments({ status: 'pending' }),
      Dispute.countDocuments({ status: { $in: ['opened', 'under_review'] } }),
      ServiceCategory.countDocuments(),
    ]);

    // Financial revenue statistics
    const completedWorkOrders = await WorkOrder.find({ status: 'completed' }, 'finalCost');
    const totalRevenue = completedWorkOrders.reduce((sum, wo) => sum + (wo.finalCost || 0), 0);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalProviders,
        totalAppointments,
        pendingBookings,
        completedAppointments,
        cancelledAppointments,
        totalWorkOrders,
        activeWorkOrders,
        pendingScopeChanges,
        activeDisputes,
        totalCategories,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, status, search } = req.query;
    let filter: any = {};

    if (role && role !== 'all') filter.role = role;
    if (status && status !== 'all') filter.status = status;

    let users = await User.find(filter).sort({ createdAt: -1 });

    if (search) {
      const q = (search as string).toLowerCase();
      users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    // Attach profile details
    const usersWithProfiles = await Promise.all(
      users.map(async (u) => {
        let profile = null;
        if (u.role === 'customer') {
          profile = await CustomerProfile.findOne({ user: u._id });
        } else if (u.role === 'provider') {
          profile = await ProviderProfile.findOne({ user: u._id }).populate('categories');
        }
        return {
          ...u.toObject(),
          profile,
        };
      })
    );

    res.json({ success: true, count: usersWithProfiles.length, data: usersWithProfiles });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'active' | 'suspended'

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (user.role === 'admin') {
      res.status(400).json({ success: false, message: 'Admin accounts cannot be suspended.' });
      return;
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} has been ${status === 'active' ? 'activated' : 'suspended'}.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [recentAppointments, recentWorkOrders, recentScopeChanges, recentDisputes] = await Promise.all([
      Appointment.find()
        .populate('customer', 'name')
        .populate('provider', 'name')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      WorkOrder.find()
        .populate('customer', 'name')
        .populate('provider', 'name')
        .sort({ updatedAt: -1 })
        .limit(10),
      ScopeChange.find()
        .populate('requestedBy', 'name role')
        .sort({ createdAt: -1 })
        .limit(10),
      Dispute.find()
        .populate('raisedBy', 'name')
        .populate('againstUser', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({
      success: true,
      data: {
        recentAppointments,
        recentWorkOrders,
        recentScopeChanges,
        recentDisputes,
      },
    });
  } catch (error) {
    next(error);
  }
};

