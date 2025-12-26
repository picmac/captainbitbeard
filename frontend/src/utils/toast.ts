import { toast as retroToast } from '../components/RetroEffects';
import { getUserFriendlyError } from './errorMessages';

/**
 * Enhanced toast utilities with user-friendly error handling
 * Using the Retro Gaming notification system
 */

export const toast = {
  /**
   * Show success message
   */
  success: (message: string, description?: string) => {
    return retroToast.success(message, description);
  },

  /**
   * Show error message with user-friendly translation
   */
  error: (error: any, customMessage?: string) => {
    const errorInfo = getUserFriendlyError(error);

    const title = customMessage || errorInfo.title;
    const message = `${errorInfo.message}\n${errorInfo.solution}`;

    return retroToast.error(title, message);
  },

  /**
   * Show warning message
   */
  warning: (message: string, description?: string) => {
    return retroToast.warning(message, description);
  },

  /**
   * Show info message
   */
  info: (message: string, description?: string) => {
    return retroToast.info(message, description);
  },

  /**
   * Show loading toast with promise
   * Note: RetroToast doesn't have built-in promise support,
   * so we implement it manually
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): Promise<T> => {
    // Show loading toast
    const loadingId = retroToast.info(messages.loading);

    return promise
      .then((data) => {
        // Dismiss loading and show success
        retroToast.dismiss(loadingId);
        const successMessage =
          typeof messages.success === 'function' ? messages.success(data) : messages.success;
        retroToast.success(successMessage);
        return data;
      })
      .catch((error) => {
        // Dismiss loading and show error
        retroToast.dismiss(loadingId);
        const errorInfo = getUserFriendlyError(error);
        const errorMessage =
          typeof messages.error === 'function'
            ? messages.error(error)
            : `${messages.error}: ${errorInfo.message}`;
        retroToast.error(errorMessage, errorInfo.solution);
        throw error;
      });
  },

  /**
   * Dismiss all toasts
   */
  dismiss: (id?: string) => {
    if (id) {
      retroToast.dismiss(id);
    } else {
      retroToast.clearAll();
    }
  },
};
