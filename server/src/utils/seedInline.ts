import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { CustomerProfile } from '../models/CustomerProfile';
import { ProviderProfile } from '../models/ProviderProfile';
import { ServiceCategory } from '../models/ServiceCategory';
import { Appointment } from '../models/Appointment';
import { WorkOrder } from '../models/WorkOrder';
import { ScopeChange } from '../models/ScopeChange';
import { CompletionApproval } from '../models/CompletionApproval';
import { Dispute } from '../models/Dispute';
import { Notification } from '../models/Notification';
import { Review } from '../models/Review';

export const seedDataInline = async () => {
  console.log('[SeedInline] Seeding collections...');

  // Password hashes
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', salt);
  const providerPasswordHash = await bcrypt.hash('Provider123!', salt);
  const customerPasswordHash = await bcrypt.hash('Customer123!', salt);

  // 1. Categories
  const categories = await ServiceCategory.create([
    {
      name: 'Electrical Repairs & Smart Home',
      slug: 'electrical-repairs-smart-home',
      description: 'Breaker panel repairs, lighting installation, EV chargers, outlet replacements, and smart thermostat setups.',
      icon: 'Zap',
      basePrice: 85,
      estimatedDurationHours: 2,
      isActive: true,
    },
    {
      name: 'Plumbing & Drain Clearing',
      slug: 'plumbing-drain-clearing',
      description: 'Leak detection, pipe repairs, faucet installation, water heater diagnostics, and hydro-jet drain snaking.',
      icon: 'Droplet',
      basePrice: 95,
      estimatedDurationHours: 2.5,
      isActive: true,
    },
    {
      name: 'HVAC & Climate Control',
      slug: 'hvac-climate-control',
      description: 'Central air conditioning service, furnace tune-ups, filter replacements, duct inspection, and heat pump repairs.',
      icon: 'Thermometer',
      basePrice: 110,
      estimatedDurationHours: 3,
      isActive: true,
    },
    {
      name: 'Major Appliance Repair',
      slug: 'major-appliance-repair',
      description: 'Diagnosis and component replacement for refrigerators, dishwashers, ovens, dryers, and washing machines.',
      icon: 'Wrench',
      basePrice: 75,
      estimatedDurationHours: 1.5,
      isActive: true,
    },
    {
      name: 'Carpentry & Cabinetry',
      slug: 'carpentry-cabinetry',
      description: 'Custom shelving, door realignment, trim and moulding, deck repairs, and hardware adjustments.',
      icon: 'Hammer',
      basePrice: 70,
      estimatedDurationHours: 4,
      isActive: true,
    },
    {
      name: 'Painting & Drywall Patching',
      slug: 'painting-drywall-patching',
      description: 'Interior wall painting, drywall hole and crack repair, ceiling texture blending, and trim finishing.',
      icon: 'Paintbrush',
      basePrice: 65,
      estimatedDurationHours: 3.5,
      isActive: true,
    },
  ]);

  // 2. Admin
  const adminUser = await User.create({
    name: 'Administrator',
    email: 'admin@servicevisit.com',
    passwordHash: adminPasswordHash,
    role: 'admin',
    phone: '+1 (555) 010-0099',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    status: 'active',
  });

  // 3. Providers
  const providerMarcus = await User.create({
    name: 'Marcus Vance',
    email: 'marcus@vanceelectric.com',
    passwordHash: providerPasswordHash,
    role: 'provider',
    phone: '+1 (555) 432-1098',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    status: 'active',
  });

  const providerElena = await User.create({
    name: 'Elena Rostova',
    email: 'elena@premierflow.com',
    passwordHash: providerPasswordHash,
    role: 'provider',
    phone: '+1 (555) 876-5432',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    status: 'active',
  });

  const providerLiam = await User.create({
    name: 'Liam Gallagher',
    email: 'liam@apexair.com',
    passwordHash: providerPasswordHash,
    role: 'provider',
    phone: '+1 (555) 321-9876',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    status: 'active',
  });

  await ProviderProfile.create([
    {
      user: providerMarcus._id,
      businessName: 'Vance Electric & Smart Solutions',
      bio: 'Licensed master electrician with 12+ years of residential and commercial experience. Specializing in panel upgrades and clean electrical troubleshooting.',
      categories: [categories[0]._id, categories[3]._id],
      experienceYears: 12,
      hourlyRate: 85,
      ratingAverage: 4.9,
      reviewCount: 38,
      serviceRadiusMiles: 30,
      isVerified: true,
      licenseNumber: 'EL-90821-MA',
    },
    {
      user: providerElena._id,
      businessName: 'Premier Flow Plumbing & Heating',
      bio: 'Certified plumbing technician dedicated to clean, damage-free repairs, fast leak resolution, and honest fixed-estimate billing.',
      categories: [categories[1]._id],
      experienceYears: 8,
      hourlyRate: 95,
      ratingAverage: 4.8,
      reviewCount: 26,
      serviceRadiusMiles: 25,
      isVerified: true,
      licenseNumber: 'PL-55410-WA',
    },
    {
      user: providerLiam._id,
      businessName: 'Apex Air & Climate Control',
      bio: 'HVAC specialist certified in high-efficiency refrigeration and forced-air climate systems. Rapid diagnosis and energy-saving recommendations.',
      categories: [categories[2]._id],
      experienceYears: 10,
      hourlyRate: 110,
      ratingAverage: 5.0,
      reviewCount: 42,
      serviceRadiusMiles: 35,
      isVerified: true,
      licenseNumber: 'HV-77291-TX',
    },
  ]);

  // 4. Customers
  const customerSarah = await User.create({
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    passwordHash: customerPasswordHash,
    role: 'customer',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    status: 'active',
  });

  const customerAlex = await User.create({
    name: 'Alex Rivera',
    email: 'alex@example.com',
    passwordHash: customerPasswordHash,
    role: 'customer',
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    status: 'active',
  });

  const customerDavid = await User.create({
    name: 'David Chen',
    email: 'david@example.com',
    passwordHash: customerPasswordHash,
    role: 'customer',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250',
    status: 'active',
  });

  await CustomerProfile.create([
    {
      user: customerSarah._id,
      address: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        zipCode: '97477',
        landmark: 'Near Springfield Elementary',
      },
      preferredContactMethod: 'in_app',
    },
    {
      user: customerAlex._id,
      address: {
        street: '1204 Pinecone Ridge Way',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        landmark: 'Building B, Apartment 402',
      },
      preferredContactMethod: 'in_app',
    },
    {
      user: customerDavid._id,
      address: {
        street: '558 Oak Valley Blvd',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        landmark: 'Blue gate on the corner',
      },
      preferredContactMethod: 'in_app',
    },
  ]);

  // 5. Appointments & Work Orders
  // Pending
  await Appointment.create({
    bookingId: 'SVT-BK-2026-P101',
    customer: customerSarah._id,
    provider: providerMarcus._id,
    category: categories[0]._id,
    appointmentDate: new Date(Date.now() + 86400000 * 2),
    timeSlot: '10:00 AM - 12:00 PM',
    address: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      zipCode: '97477',
      landmark: 'Near Springfield Elementary',
    },
    description: 'Living room chandelier flickers intermittently and kitchen island dimmer switch buzzes when turned to medium brightness.',
    estimatedCost: 170,
    status: 'pending',
    statusHistory: [
      {
        status: 'pending',
        changedBy: customerSarah._id,
        note: 'Customer requested appointment online.',
        timestamp: new Date(Date.now() - 3600000 * 4),
      },
    ],
  });

  // Accepted
  const apptAccepted = await Appointment.create({
    bookingId: 'SVT-BK-2026-A202',
    customer: customerAlex._id,
    provider: providerElena._id,
    category: categories[1]._id,
    appointmentDate: new Date(Date.now() + 86400000),
    timeSlot: '02:00 PM - 04:00 PM',
    address: {
      street: '1204 Pinecone Ridge Way',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      landmark: 'Building B, Apartment 402',
    },
    description: 'Slow draining shower in guest bathroom and persistent dripping faucet in kitchen sink.',
    estimatedCost: 190,
    status: 'accepted',
    statusHistory: [
      {
        status: 'pending',
        changedBy: customerAlex._id,
        timestamp: new Date(Date.now() - 86400000 * 2),
      },
      {
        status: 'accepted',
        changedBy: providerElena._id,
        note: 'Accepted by Elena Rostova. Tools and drain snake prepared.',
        timestamp: new Date(Date.now() - 86400000 * 1),
      },
    ],
  });

  const workOrderAlex = await WorkOrder.create({
    workOrderId: 'SVT-WO-2026-B202',
    bookingId: apptAccepted.bookingId,
    appointment: apptAccepted._id,
    customer: customerAlex._id,
    provider: providerElena._id,
    originalScope: apptAccepted.description,
    estimatedCost: 190,
    finalCost: 190,
    scheduledDate: apptAccepted.appointmentDate,
    timeSlot: apptAccepted.timeSlot,
    status: 'created',
    workHistory: [
      {
        status: 'created',
        note: 'Work order generated automatically upon appointment acceptance.',
        updatedBy: providerElena._id,
        timestamp: new Date(Date.now() - 86400000 * 1),
      },
    ],
  });

  // In Progress with Pending Scope Change
  const apptInProgress = await Appointment.create({
    bookingId: 'SVT-BK-2026-C303',
    customer: customerDavid._id,
    provider: providerLiam._id,
    category: categories[2]._id,
    appointmentDate: new Date(),
    timeSlot: '09:00 AM - 12:00 PM',
    address: {
      street: '558 Oak Valley Blvd',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      landmark: 'Blue gate on the corner',
    },
    description: 'AC unit outdoor fan stopped spinning and indoor airflow is blowing lukewarm air.',
    estimatedCost: 220,
    status: 'in_progress',
    statusHistory: [
      {
        status: 'pending',
        changedBy: customerDavid._id,
        timestamp: new Date(Date.now() - 86400000 * 3),
      },
      {
        status: 'accepted',
        changedBy: providerLiam._id,
        timestamp: new Date(Date.now() - 86400000 * 2),
      },
      {
        status: 'in_progress',
        changedBy: providerLiam._id,
        note: 'Provider arrived on site and commenced diagnostic inspection.',
        timestamp: new Date(Date.now() - 3600000 * 2),
      },
    ],
  });

  const workOrderDavid = await WorkOrder.create({
    workOrderId: 'SVT-WO-2026-C303',
    bookingId: apptInProgress.bookingId,
    appointment: apptInProgress._id,
    customer: customerDavid._id,
    provider: providerLiam._id,
    originalScope: apptInProgress.description,
    estimatedCost: 220,
    finalCost: 220,
    scheduledDate: apptInProgress.appointmentDate,
    timeSlot: apptInProgress.timeSlot,
    status: 'in_progress',
    beforePhotos: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
    ],
    workHistory: [
      {
        status: 'created',
        note: 'Work order created upon booking acceptance.',
        updatedBy: providerLiam._id,
        timestamp: new Date(Date.now() - 86400000 * 2),
      },
      {
        status: 'in_progress',
        note: 'Technician on site. Disassembled condenser housing and found blown dual-run capacitor.',
        updatedBy: providerLiam._id,
        timestamp: new Date(Date.now() - 3600000 * 2),
      },
    ],
  });

  await ScopeChange.create({
    changeId: 'SVT-SC-9011',
    workOrder: workOrderDavid._id,
    bookingId: workOrderDavid.bookingId,
    requestedBy: providerLiam._id,
    requestedByRole: 'provider',
    originalScopeSnapshot: workOrderDavid.originalScope,
    proposedScope: 'Replace failed 45/5 MFD 440V dual-run capacitor and flush clogged condensate drain line to prevent compressor burnout.',
    reason: 'During initial diagnostic inspection, capacitor tested at 0 MFD (completely blown) and condensate pan was full to overflow safety switch.',
    additionalCost: 135,
    status: 'pending',
  });

  // Pending Sign-Off
  const apptSignOff = await Appointment.create({
    bookingId: 'SVT-BK-2026-D404',
    customer: customerAlex._id,
    provider: providerMarcus._id,
    category: categories[0]._id,
    appointmentDate: new Date(Date.now() - 86400000),
    timeSlot: '01:00 PM - 03:00 PM',
    address: {
      street: '1204 Pinecone Ridge Way',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      landmark: 'Building B, Apartment 402',
    },
    description: 'Install dedicated 240V NEMA 14-50 EV charging outlet in garage and label main panel breaker.',
    estimatedCost: 350,
    status: 'completed',
    statusHistory: [
      {
        status: 'completed',
        changedBy: providerMarcus._id,
        note: 'Installation verified with multimeter at 242V. Ready for customer sign-off.',
        timestamp: new Date(Date.now() - 3600000 * 3),
      },
    ],
  });

  const workOrderAlexEV = await WorkOrder.create({
    workOrderId: 'SVT-WO-2026-D404',
    bookingId: apptSignOff.bookingId,
    appointment: apptSignOff._id,
    customer: customerAlex._id,
    provider: providerMarcus._id,
    originalScope: apptSignOff.description,
    estimatedCost: 350,
    finalCost: 350,
    scheduledDate: apptSignOff.appointmentDate,
    timeSlot: apptSignOff.timeSlot,
    status: 'completed',
    beforePhotos: [
      'https://images.unsplash.com/photo-1558441719-8b4e0c81d56b?auto=format&fit=crop&q=80&w=600',
    ],
    afterPhotos: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
    ],
    providerCompletionNotes: 'Installed high-grade industrial NEMA 14-50 receptacle with 6-gauge Romex wire and 50A Square D breaker. Tested voltage under load.',
    completedAt: new Date(Date.now() - 3600000 * 3),
  });

  await CompletionApproval.create({
    completionRecordId: 'SVT-CR-5501',
    workOrder: workOrderAlexEV._id,
    bookingId: workOrderAlexEV.bookingId,
    customer: customerAlex._id,
    provider: providerMarcus._id,
    originalScope: workOrderAlexEV.originalScope,
    approvedScopeChanges: [],
    totalFinalCost: 350,
    finalCompletionStatus: 'pending',
    providerNotes: 'Installed high-grade industrial NEMA 14-50 receptacle with 6-gauge Romex wire and 50A Square D breaker. Tested voltage under load.',
    providerPhotos: {
      before: [
        'https://images.unsplash.com/photo-1558441719-8b4e0c81d56b?auto=format&fit=crop&q=80&w=600',
      ],
      after: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
      ],
    },
    providerCompletionTimestamp: new Date(Date.now() - 3600000 * 3),
  });

  // Completed & Reviewed
  const apptCompleted = await Appointment.create({
    bookingId: 'SVT-BK-2026-E505',
    customer: customerSarah._id,
    provider: providerLiam._id,
    category: categories[2]._id,
    appointmentDate: new Date(Date.now() - 86400000 * 5),
    timeSlot: '08:00 AM - 10:00 AM',
    address: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      zipCode: '97477',
      landmark: 'Near Springfield Elementary',
    },
    description: 'Annual heat pump tune-up and electrostatic air filter replacement.',
    estimatedCost: 180,
    status: 'completed',
    statusHistory: [
      {
        status: 'completed',
        changedBy: customerSarah._id,
        note: 'Customer signed off with 5-star rating.',
        timestamp: new Date(Date.now() - 86400000 * 5 + 3600000 * 3),
      },
    ],
  });

  const workOrderCompleted = await WorkOrder.create({
    workOrderId: 'SVT-WO-2026-E505',
    bookingId: apptCompleted.bookingId,
    appointment: apptCompleted._id,
    customer: customerSarah._id,
    provider: providerLiam._id,
    originalScope: apptCompleted.description,
    estimatedCost: 180,
    finalCost: 220,
    scheduledDate: apptCompleted.appointmentDate,
    timeSlot: apptCompleted.timeSlot,
    status: 'completed',
    providerCompletionNotes: 'System running at optimal COP efficiency. Replaced filter and cleaned outdoor coils.',
    completedAt: new Date(Date.now() - 86400000 * 5 + 3600000 * 2),
  });

  await ScopeChange.create({
    changeId: 'SVT-SC-8022',
    workOrder: workOrderCompleted._id,
    bookingId: workOrderCompleted.bookingId,
    requestedBy: providerLiam._id,
    requestedByRole: 'provider',
    originalScopeSnapshot: workOrderCompleted.originalScope,
    proposedScope: 'Upgrade to high-MERV antimicrobial HEPA filter and sanitize evaporator pan.',
    reason: 'Customer inquired about seasonal allergy filtration during visit.',
    additionalCost: 40,
    status: 'approved',
    decidedBy: customerSarah._id,
    decisionNotes: 'Approved - allergy reduction is very important for our family.',
    decidedAt: new Date(Date.now() - 86400000 * 5 + 3600000 * 1),
  });

  await CompletionApproval.create({
    completionRecordId: 'SVT-CR-4402',
    workOrder: workOrderCompleted._id,
    bookingId: workOrderCompleted.bookingId,
    customer: customerSarah._id,
    provider: providerLiam._id,
    originalScope: workOrderCompleted.originalScope,
    approvedScopeChanges: [
      {
        changeId: 'SVT-SC-8022',
        proposedScope: 'Upgrade to high-MERV antimicrobial HEPA filter and sanitize evaporator pan.',
        additionalCost: 40,
        approvedAt: new Date(Date.now() - 86400000 * 5 + 3600000 * 1),
      },
    ],
    totalFinalCost: 220,
    finalCompletionStatus: 'approved',
    providerNotes: 'System running at optimal COP efficiency. Replaced filter and cleaned outdoor coils.',
    customerApprovalTimestamp: new Date(Date.now() - 86400000 * 5 + 3600000 * 3),
    customerFeedback: 'Liam was punctual, professional, and explained the scope change clearly before touching anything. Highly recommended!',
    rating: 5,
    providerCompletionTimestamp: new Date(Date.now() - 86400000 * 5 + 3600000 * 2),
  });

  await Review.create({
    appointment: apptCompleted._id,
    workOrder: workOrderCompleted._id,
    customer: customerSarah._id,
    provider: providerLiam._id,
    rating: 5,
    comment: 'Liam was punctual, professional, and explained the scope change clearly before touching anything. Highly recommended!',
  });

  // 6. Dispute
  await Dispute.create({
    disputeId: 'SVT-DSP-4011',
    appointment: apptAccepted._id,
    workOrder: workOrderAlex._id,
    bookingId: apptAccepted.bookingId,
    raisedBy: customerAlex._id,
    againstUser: providerElena._id,
    reason: 'scope_disagreement',
    title: 'Disagreement on parts inclusion in drain clearing estimate',
    description: 'The original booking stated drain snake clearing was included in the base rate, but provider messaged saying specialized trap seals would cost extra $60 outside of work order.',
    desiredResolution: 'Confirm whether trap seals are standard requirement or if original estimate covers it without surprise charges.',
    status: 'opened',
    messages: [
      {
        sender: customerAlex._id,
        senderRole: 'customer',
        message: 'Hello, I booked the $190 estimate for drain clearing. Please clarify why you requested an extra $60 off-platform for basic trap seals.',
        timestamp: new Date(Date.now() - 3600000 * 18),
      },
      {
        sender: providerElena._id,
        senderRole: 'provider',
        message: 'Hi Alex, the $190 covers standard mechanical snaking up to 25 ft. Your apartment has corroded brass P-traps that often disintegrate when disassembled, so I recommended submitting a formal scope change here through ServiceVisit Tracker.',
        timestamp: new Date(Date.now() - 3600000 * 12),
      },
    ],
  });

  // 7. Notifications
  await Notification.create([
    {
      recipient: customerSarah._id,
      title: 'Appointment Request Submitted',
      message: 'Your electrical service booking SVT-BK-2026-P101 has been submitted to Marcus Vance. Waiting for provider confirmation.',
      type: 'booking',
      link: '/customer/my-appointments',
      isRead: false,
    },
    {
      recipient: customerDavid._id,
      title: 'Scope Change Approval Required',
      message: 'Liam Gallagher submitted a scope change for Work Order SVT-WO-2026-C303 (+$135). Review and approve or reject.',
      type: 'scope_change',
      link: '/customer/scope-change-history',
      isRead: false,
    },
    {
      recipient: customerAlex._id,
      title: 'Sign-Off Needed: EV Charger Installation',
      message: 'Marcus Vance marked Work Order SVT-WO-2026-D404 as completed. Please inspect the work and confirm sign-off.',
      type: 'completion',
      link: '/customer/completion-approvals',
      isRead: false,
    },
    {
      recipient: providerMarcus._id,
      title: 'New Service Booking Request',
      message: 'Sarah Connor requested an appointment for Electrical Repairs on Thursday. Click to accept or reject.',
      type: 'booking',
      link: '/provider/booking-requests',
      isRead: false,
    },
    {
      recipient: adminUser._id,
      title: 'New Dispute Opened',
      message: 'Customer Alex Rivera opened dispute SVT-DSP-4011 regarding Scope Disagreement with Elena Rostova.',
      type: 'dispute',
      link: '/admin/disputes',
      isRead: false,
    },
  ]);

  console.log('[SeedInline] Seed complete!');
};

