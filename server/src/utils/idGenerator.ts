import crypto from 'crypto';

export const generateBookingId = (): string => {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SVT-BK-${year}-${rand}`;
};

export const generateWorkOrderId = (): string => {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SVT-WO-${year}-${rand}`;
};

export const generateScopeChangeId = (): string => {
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SVT-SC-${rand}`;
};

export const generateCompletionId = (): string => {
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SVT-CR-${rand}`;
};

export const generateDisputeId = (): string => {
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SVT-DSP-${rand}`;
};

