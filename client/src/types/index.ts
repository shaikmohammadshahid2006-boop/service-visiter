export type UserRole = 'customer' | 'provider' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  status: UserStatus;
  profile?: any;
}

export interface ServiceCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  basePrice: number;
  estimatedDurationHours: number;
  isActive: boolean;
}

export interface ProviderProfile {
  _id: string;
  user: User;
  businessName: string;
  bio: string;
  categories: ServiceCategory[];
  experienceYears: number;
  hourlyRate: number;
  ratingAverage: number;
  reviewCount: number;
  serviceRadiusMiles: number;
  isVerified: boolean;
  licenseNumber?: string;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
    isAcceptingBookings: boolean;
  };
}

export interface CustomerProfile {
  _id: string;
  user: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    landmark?: string;
  };
  alternatePhone?: string;
  emergencyContact?: string;
  preferredContactMethod?: 'email' | 'phone' | 'in_app';
}

export type AppointmentStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Appointment {
  _id: string;
  bookingId: string;
  customer: User;
  provider: User;
  category: ServiceCategory;
  appointmentDate: string;
  timeSlot: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    landmark?: string;
  };
  description: string;
  estimatedCost: number;
  status: AppointmentStatus;
  statusHistory: Array<{
    status: AppointmentStatus;
    changedBy: string;
    note?: string;
    timestamp: string;
  }>;
  cancellationReason?: string;
  rejectedReason?: string;
  createdAt: string;
  workOrder?: WorkOrder;
}

export type WorkOrderStatus = 'created' | 'in_progress' | 'completed' | 'cancelled';

export interface WorkOrder {
  _id: string;
  workOrderId: string;
  bookingId: string;
  appointment: any;
  customer: User;
  provider: User;
  originalScope: string;
  estimatedCost: number;
  finalCost: number;
  scheduledDate: string;
  timeSlot: string;
  status: WorkOrderStatus;
  workHistory: Array<{
    status: string;
    note: string;
    updatedBy: any;
    timestamp: string;
  }>;
  beforePhotos: string[];
  afterPhotos: string[];
  providerCompletionNotes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  scopeChanges?: ScopeChange[];
  completionRecord?: CompletionApproval;
}

export type ScopeChangeStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface ScopeChange {
  _id: string;
  changeId: string;
  workOrder: any;
  bookingId: string;
  requestedBy: User;
  requestedByRole: 'customer' | 'provider';
  originalScopeSnapshot: string;
  proposedScope: string;
  reason: string;
  additionalCost: number;
  status: ScopeChangeStatus;
  decidedBy?: User;
  decisionNotes?: string;
  decidedAt?: string;
  createdAt: string;
}

export type CompletionStatus = 'pending' | 'approved' | 'issue_reported';

export interface CompletionApproval {
  _id: string;
  completionRecordId: string;
  workOrder: any;
  bookingId: string;
  customer: User;
  provider: User;
  originalScope: string;
  approvedScopeChanges: Array<{
    changeId: string;
    proposedScope: string;
    additionalCost: number;
    approvedAt: string;
  }>;
  totalFinalCost: number;
  finalCompletionStatus: CompletionStatus;
  providerNotes: string;
  providerPhotos: {
    before: string[];
    after: string[];
  };
  providerCompletionTimestamp: string;
  customerApprovalTimestamp?: string;
  customerFeedback?: string;
  rating?: number;
  reportedIssueDetails?: string;
  reportedIssueTimestamp?: string;
  createdAt: string;
}

export type DisputeReason =
  | 'incomplete_work'
  | 'incorrect_work'
  | 'unauthorized_charges'
  | 'missed_appointment'
  | 'scope_disagreement'
  | 'other';

export type DisputeStatus = 'opened' | 'under_review' | 'resolved' | 'rejected';

export interface DisputeMessage {
  sender: User;
  senderRole: 'customer' | 'provider' | 'admin';
  message: string;
  attachments?: string[];
  timestamp: string;
}

export interface Dispute {
  _id: string;
  disputeId: string;
  workOrder?: any;
  appointment?: any;
  bookingId: string;
  raisedBy: User;
  againstUser: User;
  reason: DisputeReason;
  title: string;
  description: string;
  desiredResolution: string;
  status: DisputeStatus;
  messages: DisputeMessage[];
  adminNotes?: string;
  resolutionSummary?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'booking' | 'work_order' | 'scope_change' | 'completion' | 'dispute' | 'system';
  link?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Review {
  _id: string;
  appointment: string;
  workOrder?: string;
  customer: User;
  provider: string;
  rating: number;
  comment: string;
  createdAt: string;
}
