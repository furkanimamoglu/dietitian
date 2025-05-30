import { toast } from 'react-hot-toast';

/**
 * Display a success toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Additional options for the toast
 */
export const showSuccessToast = (message, options = {}) => {
  toast.success(message, {
    duration: 3000,
    ...options
  });
};

/**
 * Display an error toast notification
 * @param {string} message - The error message to display
 * @param {Object} options - Additional options for the toast
 */
export const showErrorToast = (message, options = {}) => {
  toast.error(message, {
    duration: 4000, // Slightly longer duration for errors
    ...options
  });
};

/**
 * Display a generic toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Additional options for the toast
 */
export const showToast = (message, options = {}) => {
  toast(message, {
    duration: 3000,
    ...options
  });
}; 