import { toast as sonnerToast } from 'sonner';
import { getUserFriendlyError } from './errorMessages';

/**
 * Enhanced toast utilities with user-friendly error handling
 */

export const toast = {
  /**
   * Show success message
   */
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show error message with user-friendly translation
   */
  error: (error: any, customMessage?: string) => {
    const errorInfo = getUserFriendlyError(error);

    sonnerToast.error(customMessage || errorInfo.title, {
      description: `${errorInfo.message}\n${errorInfo.solution}`,
      duration: 6000,
    });
  },

  /**
   * Show warning message
   */
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Show info message
   */
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show loading toast with promise
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: (error) => {
        const errorInfo = getUserFriendlyError(error);
        return typeof messages.error === 'function'
          ? messages.error(error)
          : `${messages.error}: ${errorInfo.message}`;
      },
    });
  },

  /**
   * Dismiss all toasts
   */
  dismiss: () => {
    sonnerToast.dismiss();
  },
};
