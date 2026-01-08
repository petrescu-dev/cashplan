/**
 * Utility functions for user ID management
 */

const MIN_UNAUTHENTICATED_ID = -100000000;
const MAX_UNAUTHENTICATED_ID = -1000;

/**
 * Generate a random negative user ID for unauthenticated users
 * Range: -100000000 to -1000
 */
export const generateUnauthenticatedUserId = (): number => {
  const range = MAX_UNAUTHENTICATED_ID - MIN_UNAUTHENTICATED_ID + 1;
  const randomOffset = Math.floor(Math.random() * range);
  return MIN_UNAUTHENTICATED_ID + randomOffset;
};

/**
 * Check if a user ID is for an unauthenticated user
 */
export const isUnauthenticatedUserId = (userId: number): boolean => {
  return userId >= MIN_UNAUTHENTICATED_ID && userId <= MAX_UNAUTHENTICATED_ID;
};

/**
 * Check if a user ID is for an authenticated user
 */
export const isAuthenticatedUserId = (userId: number): boolean => {
  return userId > 0;
};

