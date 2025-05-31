import crypto from 'crypto';

export const generateOrderId = () => crypto.randomBytes(12).toString('hex').toUpperCase();

