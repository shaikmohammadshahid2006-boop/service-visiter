import { Request, Response, NextFunction } from 'express';
import { ServiceCategory } from '../models/ServiceCategory';
import { ProviderProfile } from '../models/ProviderProfile';
import { Review } from '../models/Review';
import { AuthRequest } from '../types';

export const getServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    const categories = await ServiceCategory.find(filter).sort({ name: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Service category not found' });
      return;
    }
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, icon, basePrice, estimatedDurationHours, isActive } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await ServiceCategory.findOne({ slug });
    if (existing) {
      res.status(409).json({ success: false, message: 'A service category with this name already exists' });
      return;
    }

    const category = await ServiceCategory.create({
      name,
      slug,
      description,
      icon: icon || 'Wrench',
      basePrice: Number(basePrice) || 60,
      estimatedDurationHours: Number(estimatedDurationHours) || 2,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, message: 'Service category created successfully', data: category });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, icon, basePrice, estimatedDurationHours, isActive } = req.body;
    const updateData: any = {};
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (basePrice !== undefined) updateData.basePrice = Number(basePrice);
    if (estimatedDurationHours !== undefined) updateData.estimatedDurationHours = Number(estimatedDurationHours);
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await ServiceCategory.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!category) {
      res.status(404).json({ success: false, message: 'Service category not found' });
      return;
    }

    res.json({ success: true, message: 'Service category updated successfully', data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await ServiceCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Service category not found' });
      return;
    }
    res.json({ success: true, message: 'Service category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getProviders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoryId, search } = req.query;
    let query: any = {};

    if (categoryId) {
      query.categories = categoryId;
    }

    const providers = await ProviderProfile.find(query)
      .populate('user', 'name email phone avatar status')
      .populate('categories');

    // Filter out suspended users
    const activeProviders = providers.filter((p: any) => p.user && p.user.status === 'active');

    res.json({ success: true, count: activeProviders.length, data: activeProviders });
  } catch (error) {
    next(error);
  }
};

export const getProviderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = await ProviderProfile.findOne({ user: req.params.id })
      .populate('user', 'name email phone avatar status')
      .populate('categories');

    if (!provider) {
      res.status(404).json({ success: false, message: 'Service provider not found' });
      return;
    }

    const reviews = await Review.find({ provider: req.params.id })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { ...provider.toObject(), reviews } });
  } catch (error) {
    next(error);
  }
};

