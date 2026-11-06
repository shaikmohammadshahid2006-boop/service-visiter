import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['customer', 'provider']).default('customer'),
    phone: z.string().optional().default(''),
    // Customer profile fields
    address: z
      .object({
        street: z.string().optional().default(''),
        city: z.string().optional().default(''),
        state: z.string().optional().default(''),
        zipCode: z.string().optional().default(''),
        landmark: z.string().optional().default(''),
      })
      .optional(),
    // Provider profile fields
    businessName: z.string().optional(),
    bio: z.string().optional(),
    hourlyRate: z.number().optional().default(50),
    categories: z.array(z.string()).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const serviceCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name is required'),
    description: z.string().min(5, 'Description is required'),
    icon: z.string().optional().default('Wrench'),
    basePrice: z.number().min(0, 'Base price must be >= 0'),
    estimatedDurationHours: z.number().min(0.5, 'Duration must be >= 0.5 hours').default(2),
    isActive: z.boolean().optional().default(true),
  }),
});

export const createAppointmentSchema = z.object({
  body: z.object({
    providerId: z.string().min(1, 'Provider ID is required'),
    categoryId: z.string().min(1, 'Category ID is required'),
    appointmentDate: z.string().or(z.date()),
    timeSlot: z.string().min(1, 'Time slot is required'),
    address: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zipCode: z.string().min(1, 'Zip code is required'),
      landmark: z.string().optional().default(''),
    }),
    description: z.string().min(10, 'Work description must be at least 10 characters'),
    estimatedCost: z.number().min(0).default(0),
  }),
});

export const updateAppointmentStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'accepted', 'rejected', 'scheduled', 'in_progress', 'completed', 'cancelled']),
    note: z.string().optional(),
    rejectionReason: z.string().optional(),
    cancellationReason: z.string().optional(),
  }),
});

export const createScopeChangeSchema = z.object({
  body: z.object({
    workOrderId: z.string().min(1, 'Work order ID is required'),
    proposedScope: z.string().min(10, 'Proposed scope must be at least 10 characters'),
    reason: z.string().min(5, 'Reason for change must be explained'),
    additionalCost: z.number().default(0),
  }),
});

export const decideScopeChangeSchema = z.object({
  body: z.object({
    decision: z.enum(['approved', 'rejected']),
    decisionNotes: z.string().optional().default(''),
  }),
});

export const requestCompletionSchema = z.object({
  body: z.object({
    providerNotes: z.string().min(5, 'Completion notes are required'),
    beforePhotos: z.array(z.string()).optional().default([]),
    afterPhotos: z.array(z.string()).optional().default([]),
  }),
});

export const approveCompletionSchema = z.object({
  body: z.object({
    customerFeedback: z.string().optional().default(''),
    rating: z.number().min(1).max(5).default(5),
  }),
});

export const reportIssueCompletionSchema = z.object({
  body: z.object({
    reportedIssueDetails: z.string().min(10, 'Issue description must be at least 10 characters'),
  }),
});

export const createDisputeSchema = z.object({
  body: z.object({
    workOrderId: z.string().optional(),
    appointmentId: z.string().optional(),
    bookingId: z.string().optional(),
    reason: z.enum([
      'incomplete_work',
      'incorrect_work',
      'unauthorized_charges',
      'missed_appointment',
      'scope_disagreement',
      'other',
    ]),
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(15, 'Dispute description must be at least 15 characters'),
    desiredResolution: z.string().optional().default(''),
  }),
});

export const addDisputeMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message cannot be empty'),
    attachments: z.array(z.string()).optional().default([]),
  }),
});

export const resolveDisputeSchema = z.object({
  body: z.object({
    status: z.enum(['opened', 'under_review', 'resolved', 'rejected']),
    adminNotes: z.string().optional().default(''),
    resolutionSummary: z.string().min(5, 'Resolution summary is required'),
  }),
});

