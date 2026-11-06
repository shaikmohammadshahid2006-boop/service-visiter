import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { CustomerProfile } from '../models/CustomerProfile';
import { ProviderProfile } from '../models/ProviderProfile';
import { ServiceCategory } from '../models/ServiceCategory';
import { Notification } from '../models/Notification';
import { generateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, phone, address, businessName, bio, hourlyRate, categories } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'customer',
      phone: phone || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      status: 'active',
    });

    let profile: any = null;

    if (user.role === 'customer') {
      profile = await CustomerProfile.create({
        user: user._id,
        address: address || {},
      });
    } else if (user.role === 'provider') {
      let resolvedCategoryIds: any[] = [];
      if (categories && Array.isArray(categories) && categories.length > 0) {
        resolvedCategoryIds = categories;
      } else {
        // default to first active category if none selected
        const firstCat = await ServiceCategory.findOne({ isActive: true });
        if (firstCat) resolvedCategoryIds = [firstCat._id];
      }

      profile = await ProviderProfile.create({
        user: user._id,
        businessName: businessName || `${user.name}'s Services`,
        bio: bio || 'Professional household service provider committed to top quality and transparent communication.',
        hourlyRate: hourlyRate || 65,
        categories: resolvedCategoryIds,
        experienceYears: 3,
        ratingAverage: 5.0,
        reviewCount: 0,
        isVerified: true,
      });
    }

    const token = generateToken(user);

    // Welcome notification
    await Notification.create({
      recipient: user._id,
      title: 'Welcome to ServiceVisit Tracker',
      message: `Hello ${user.name}! Your ${user.role} account has been created successfully. Welcome aboard!`,
      type: 'system',
      link: user.role === 'customer' ? '/customer/overview' : '/provider/overview',
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ success: false, message: 'Account is suspended. Please contact platform administrators.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    let profile: any = null;
    if (user.role === 'customer') {
      profile = await CustomerProfile.findOne({ user: user._id });
    } else if (user.role === 'provider') {
      profile = await ProviderProfile.findOne({ user: user._id }).populate('categories');
    }

    const token = generateToken(user);
    const unreadNotifications = await Notification.countDocuments({ recipient: user._id, isRead: false });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
      },
      profile,
      unreadNotifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    let profile: any = null;
    if (user.role === 'customer') {
      profile = await CustomerProfile.findOne({ user: user._id });
    } else if (user.role === 'provider') {
      profile = await ProviderProfile.findOne({ user: user._id }).populate('categories');
    }

    const unreadNotifications = await Notification.countDocuments({ recipient: user._id, isRead: false });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
      },
      profile,
      unreadNotifications,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { name, phone, avatar, address, businessName, bio, hourlyRate, categories, availability } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar;
    await user.save();

    let profile: any = null;
    if (user.role === 'customer') {
      profile = await CustomerProfile.findOneAndUpdate(
        { user: user._id },
        {
          ...(address && { address }),
          ...(req.body.emergencyContact !== undefined && { emergencyContact: req.body.emergencyContact }),
          ...(req.body.preferredContactMethod && { preferredContactMethod: req.body.preferredContactMethod }),
        },
        { new: true, upsert: true }
      );
    } else if (user.role === 'provider') {
      profile = await ProviderProfile.findOneAndUpdate(
        { user: user._id },
        {
          ...(businessName && { businessName }),
          ...(bio !== undefined && { bio }),
          ...(hourlyRate !== undefined && { hourlyRate: Number(hourlyRate) }),
          ...(categories && { categories }),
          ...(availability && { availability }),
        },
        { new: true, upsert: true }
      ).populate('categories');
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

