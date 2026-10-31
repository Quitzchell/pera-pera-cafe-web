import { ApiError } from '@/api';

export function errorMessages(error: unknown) {
  if (error instanceof ApiError) return error.messages;
  if (typeof error === 'string') return [error];
  return ['Something went wrong. Please try again.'];
}
