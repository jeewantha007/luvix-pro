/**
 * Display Helper Functions
 * Clean data for display to prevent unwanted characters like quotes
 */

/**
 * Clean phone number for display by removing unwanted characters
 * @param phone - Raw phone number
 * @returns Cleaned phone number for display
 */
export const cleanPhoneForDisplay = (phone: string): string => {
  if (!phone) return '';
  
  // Remove quotes, backticks, and other unwanted characters
  let cleanPhone = String(phone).replace(/["'`]/g, '');
  
  // Remove excessive whitespace
  cleanPhone = cleanPhone.trim();
  
  return cleanPhone;
};

/**
 * Clean description for display
 * @param description - Raw description
 * @returns Cleaned description for display
 */
export const cleanDescriptionForDisplay = (description: string): string => {
  if (!description) return '';
  
  // Remove quotes and clean up whitespace
  let cleanDesc = String(description).replace(/["'`]/g, '');
  cleanDesc = cleanDesc.replace(/\s+/g, ' ').trim();
  
  return cleanDesc;
};

/**
 * Get clean initial for avatar display
 * @param phone - Phone number
 * @returns Clean initial character
 */
export const getCleanInitial = (phone: string): string => {
  if (!phone) return '?';
  
  const cleanPhone = cleanPhoneForDisplay(phone);
  
  // Get first digit of phone number
  const firstDigit = cleanPhone.match(/\d/);
  if (firstDigit) {
    return firstDigit[0];
  }
  
  return '?';
};

/**
 * Format date for display, handling invalid dates
 * @param date - Date string or Date object
 * @returns Formatted date string or fallback
 */
export const formatDateForDisplay = (date: string | Date): string => {
  if (!date) return 'No date';
  
  try {
    let dateObj: Date;
    
    // Handle different date input types
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      // Try parsing the string as a date
      dateObj = new Date(date);
    } else {
      return 'Invalid date';
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date received:', date);
      return 'Invalid date';
    }
    
    // Format as relative time
    const now = new Date();
    
    // Get dates at midnight for accurate day comparison
    const dateMidnight = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate difference in days
    const diffTime = nowMidnight.getTime() - dateMidnight.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
    
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, 'Date input:', date);
    return 'Invalid date';
  }
};

/**
 * Clean any string for display
 * @param input - Raw input string
 * @returns Cleaned string
 */
export const cleanStringForDisplay = (input: string): string => {
  if (!input) return '';
  
  // Remove quotes, backticks, and control characters
  let clean = String(input).replace(/["'`]/g, '');
  clean = clean.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Clean up whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  
  return clean;
};
