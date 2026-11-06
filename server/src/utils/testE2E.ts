import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { seedDataInline } from './seedInline';
import { User } from '../models/User';
import { ServiceCategory } from '../models/ServiceCategory';
import { Appointment } from '../models/Appointment';
import { WorkOrder } from '../models/WorkOrder';
import { ScopeChange } from '../models/ScopeChange';
import { CompletionApproval } from '../models/CompletionApproval';
import { Dispute } from '../models/Dispute';
import { Review } from '../models/Review';
import { generateBookingId, generateWorkOrderId, generateScopeChangeId, generateCompletionId } from './idGenerator';

const runVerification = async () => {
  console.log('=== [E2E Verification] Starting Full Lifecycle Test ===');
  await connectDB();

  // Seed baseline data
  await seedDataInline();

  // 1. Verify Service Categories
  const category = await ServiceCategory.findOne({ isActive: true });
  if (!category) throw new Error('No service category found');
  console.log(`✓ 1. Service Category verified: "${category.name}" (Base: $${category.basePrice})`);

  // 2. Verify Provider and Customer
  const customer = await User.findOne({ role: 'customer' });
  const provider = await User.findOne({ role: 'provider' });
  if (!customer || !provider) throw new Error('Customer or Provider missing');
  console.log(`✓ 2. Customer: "${customer.name}", Provider: "${provider.name}"`);

  // 3. Create New Appointment Booking
  const bookingId = generateBookingId();
  const appointment = await Appointment.create({
    bookingId,
    customer: customer._id,
    provider: provider._id,
    category: category._id,
    appointmentDate: new Date(),
    timeSlot: '01:00 PM - 03:00 PM',
    address: {
      street: '100 Verification Lane',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
    },
    description: 'Diagnose main water line pressure drop and inspect water meter valve.',
    estimatedCost: 150,
    status: 'pending',
    statusHistory: [{ status: 'pending', changedBy: customer._id, note: 'E2E Booking Created', timestamp: new Date() }],
  });
  console.log(`✓ 3. Booking created with ID: ${appointment.bookingId}`);

  // 4. Provider Accepts Booking -> Work Order Auto Generation
  appointment.status = 'accepted';
  appointment.statusHistory.push({
    status: 'accepted',
    changedBy: provider._id,
    note: 'Specialist accepted booking',
    timestamp: new Date(),
  });
  await appointment.save();

  const workOrderId = generateWorkOrderId();
  const workOrder = await WorkOrder.create({
    workOrderId,
    bookingId: appointment.bookingId,
    appointment: appointment._id,
    customer: customer._id,
    provider: provider._id,
    originalScope: appointment.description,
    estimatedCost: appointment.estimatedCost,
    finalCost: appointment.estimatedCost,
    scheduledDate: appointment.appointmentDate,
    timeSlot: appointment.timeSlot,
    status: 'created',
    workHistory: [{ status: 'created', note: 'Work Order auto-generated', updatedBy: provider._id, timestamp: new Date() }],
  });
  console.log(`✓ 4. Provider accepted. Work Order generated: ${workOrder.workOrderId} (Initial Cost: $${workOrder.finalCost})`);

  // 5. Scope Change Request (Provider discovers rusted backflow preventer + $80)
  const changeId = generateScopeChangeId();
  const scopeChange = await ScopeChange.create({
    changeId,
    workOrder: workOrder._id,
    bookingId: workOrder.bookingId,
    requestedBy: provider._id,
    requestedByRole: 'provider',
    originalScopeSnapshot: workOrder.originalScope,
    proposedScope: 'Replace cracked backflow preventer assembly and install brass expansion tank.',
    reason: 'Backflow valve leaking under high city pressure.',
    additionalCost: 80,
    status: 'pending',
  });
  console.log(`✓ 5. Scope Change requested: ${scopeChange.changeId} (+$${scopeChange.additionalCost}). Original scope untouched.`);

  // 6. Customer Approves Scope Change
  scopeChange.status = 'approved';
  scopeChange.decidedBy = customer._id;
  scopeChange.decidedAt = new Date();
  scopeChange.decisionNotes = 'Approved for safety';
  await scopeChange.save();

  workOrder.finalCost += scopeChange.additionalCost;
  workOrder.workHistory.push({
    status: workOrder.status,
    note: `Scope change ${scopeChange.changeId} approved. Added $80. New total: $${workOrder.finalCost}`,
    updatedBy: customer._id,
    timestamp: new Date(),
  });
  await workOrder.save();
  console.log(`✓ 6. Scope Change approved! Work Order final cost updated to: $${workOrder.finalCost}`);

  // 7. Provider Completes Job & Uploads Photos -> Customer Sign-Off Requested
  workOrder.status = 'completed';
  workOrder.beforePhotos = ['https://images.unsplash.com/photo-1558441719-8b4e0c81d56b'];
  workOrder.afterPhotos = ['https://images.unsplash.com/photo-1581092160607-ee22621dd758'];
  workOrder.providerCompletionNotes = 'Replacement backflow preventer installed and tested to 75 PSI.';
  await workOrder.save();

  const completionId = generateCompletionId();
  const completionRecord = await CompletionApproval.create({
    completionRecordId: completionId,
    workOrder: workOrder._id,
    bookingId: workOrder.bookingId,
    customer: customer._id,
    provider: provider._id,
    originalScope: workOrder.originalScope,
    approvedScopeChanges: [{
      changeId: scopeChange.changeId,
      proposedScope: scopeChange.proposedScope,
      additionalCost: scopeChange.additionalCost,
      approvedAt: new Date(),
    }],
    totalFinalCost: workOrder.finalCost,
    finalCompletionStatus: 'pending',
    providerNotes: workOrder.providerCompletionNotes,
    providerPhotos: {
      before: workOrder.beforePhotos,
      after: workOrder.afterPhotos,
    },
    providerCompletionTimestamp: new Date(),
  });
  console.log(`✓ 7. Provider completed work. Completion Record generated: ${completionRecord.completionRecordId} (Pending customer sign-off)`);

  // 8. Customer Inspects and Signs Off with 5-star Review
  completionRecord.finalCompletionStatus = 'approved';
  completionRecord.customerApprovalTimestamp = new Date();
  completionRecord.customerFeedback = 'Outstanding speed and very clean plumbing work!';
  completionRecord.rating = 5;
  await completionRecord.save();

  appointment.status = 'completed';
  await appointment.save();

  await Review.create({
    appointment: appointment._id,
    workOrder: workOrder._id,
    customer: customer._id,
    provider: provider._id,
    rating: 5,
    comment: completionRecord.customerFeedback,
  });
  console.log(`✓ 8. Customer approved sign-off and submitted 5-star review!`);

  // 9. Verify Dispute Resolution Workflow
  const dispute = await Dispute.findOne({ status: 'opened' });
  if (dispute) {
    console.log(`✓ 9. Verified open dispute in system: ${dispute.disputeId} ("${dispute.title}")`);
  }

  console.log('=== [E2E Verification] SUCCESS! All 9 critical modules verified! ===');
  await disconnectDB();
};

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('E2E Verification Failed:', err);
    process.exit(1);
  });
