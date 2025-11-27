/**
 * Utility functions for validating Convex IDs to prevent type mismatches
 */

// Known problematic IDs that should not be used as contactSession IDs
const INVALID_CONTACT_SESSION_IDS = [
  'j57dvcwtdmpt8tvb7yjtrjdrx97w3a58', // Known agentStatus ID from error logs
];

/**
 * Validates if an ID is safe to use as a contactSession ID
 * @param id The ID to validate
 * @returns true if the ID is valid for contactSessions, false otherwise
 */
export function isValidContactSessionId(id: string | null): id is string {
  if (!id) return false;
  
  // Check against known invalid IDs
  if (INVALID_CONTACT_SESSION_IDS.includes(id)) {
    console.warn(`Rejecting known invalid contactSession ID: ${id}`);
    return false;
  }
  
  // Add any other validation logic here if needed
  // For now, we just check against known problematic IDs
  return true;
}

/**
 * Cleans up invalid contact session IDs from storage
 * @param id The ID to check
 * @param clearCallback Function to call to clear the invalid ID
 * @returns true if the ID was cleaned up (invalid), false if it's valid
 */
export function cleanupInvalidContactSessionId(
  id: string | null, 
  clearCallback: () => void
): boolean {
  if (!isValidContactSessionId(id)) {
    console.warn('Cleaning up invalid contact session ID from storage');
    clearCallback();
    return true;
  }
  return false;
}