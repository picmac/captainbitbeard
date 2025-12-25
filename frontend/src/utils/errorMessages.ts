/**
 * User-friendly error message translations
 * Converts technical errors into plain language with actionable solutions
 */

interface ErrorMessageResult {
  title: string;
  message: string;
  solution: string;
  severity: 'error' | 'warning' | 'info';
}

export function getUserFriendlyError(error: any): ErrorMessageResult {
  const errorString = error?.message || error?.toString() || '';
  const statusCode = error?.response?.status;
  const responseMessage = error?.response?.data?.message || error?.response?.data?.error;

  // Network errors
  if (errorString.includes('Network Error') || errorString.includes('ERR_NETWORK')) {
    return {
      title: 'Connection Lost',
      message: 'Unable to connect to the server. Please check your internet connection.',
      solution: 'Verify your internet connection and try again.',
      severity: 'error',
    };
  }

  // CORS errors
  if (errorString.includes('CORS') || errorString.includes('cors')) {
    return {
      title: 'Connection Blocked',
      message: 'Browser security settings are blocking the connection.',
      solution: 'This is usually a temporary issue. Please refresh the page and try again.',
      severity: 'error',
    };
  }

  // Timeout errors
  if (errorString.includes('timeout') || errorString.includes('ETIMEDOUT')) {
    return {
      title: 'Request Timed Out',
      message: 'The server took too long to respond.',
      solution: 'The server might be busy. Please wait a moment and try again.',
      severity: 'warning',
    };
  }

  // HTTP Status codes
  switch (statusCode) {
    case 400:
      return {
        title: 'Invalid Request',
        message: responseMessage || 'The information provided is incorrect or incomplete.',
        solution: 'Please check your input and try again.',
        severity: 'warning',
      };

    case 401:
      return {
        title: 'Not Logged In',
        message: 'You need to be logged in to perform this action.',
        solution: 'Please log in to your account and try again.',
        severity: 'warning',
      };

    case 403:
      return {
        title: 'Access Denied',
        message: "You don't have permission to perform this action.",
        solution: 'Contact an administrator if you believe this is an error.',
        severity: 'error',
      };

    case 404:
      return {
        title: 'Not Found',
        message: responseMessage || 'The requested item could not be found.',
        solution: 'It may have been deleted or moved. Try refreshing the page.',
        severity: 'info',
      };

    case 409:
      return {
        title: 'Already Exists',
        message: responseMessage || 'This item already exists.',
        solution: 'Try using a different name or check existing items.',
        severity: 'warning',
      };

    case 413:
      return {
        title: 'File Too Large',
        message: 'The file you are trying to upload is too large.',
        solution: 'Please upload a smaller file (maximum 500MB per file).',
        severity: 'warning',
      };

    case 429:
      return {
        title: 'Too Many Requests',
        message: 'You are making requests too quickly.',
        solution: 'Please wait a moment before trying again.',
        severity: 'warning',
      };

    case 500:
    case 502:
    case 503:
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end.',
        solution: 'Please try again in a few moments. If the problem persists, contact support.',
        severity: 'error',
      };
  }

  // Emulator-specific errors
  if (errorString.includes('emulator') || errorString.includes('core')) {
    const core = errorString.match(/core:\s*(\w+)/)?.[1];
    const system = core ? getSystemNameFromCore(core) : 'this system';

    return {
      title: 'Emulator Failed to Start',
      message: `Unable to start the ${system} emulator.`,
      solution: 'Try refreshing the page. If the problem continues, this game may require additional system files (BIOS).',
      severity: 'error',
    };
  }

  // File upload errors
  if (errorString.includes('upload') || errorString.includes('file')) {
    return {
      title: 'Upload Failed',
      message: responseMessage || 'The file could not be uploaded.',
      solution: 'Check the file format and size, then try again. Supported formats: .zip, .nes, .snes, .gb, etc.',
      severity: 'error',
    };
  }

  // Metadata scraping errors
  if (errorString.includes('scrape') || errorString.includes('metadata')) {
    return {
      title: 'Game Info Unavailable',
      message: 'Unable to fetch game information from the database.',
      solution: 'The game database might be busy. Try again in a moment, or add details manually.',
      severity: 'warning',
    };
  }

  // Save state errors
  if (errorString.includes('save state') || errorString.includes('saveState')) {
    return {
      title: 'Save Failed',
      message: responseMessage || 'Unable to save your game progress.',
      solution: 'Check available storage space. You may need to delete old saves.',
      severity: 'error',
    };
  }

  // Generic fallback
  return {
    title: 'Something Went Wrong',
    message: responseMessage || errorString || 'An unexpected error occurred.',
    solution: 'Please try again. If the problem persists, contact support.',
    severity: 'error',
  };
}

/**
 * Get user-friendly system name from emulator core
 */
function getSystemNameFromCore(core: string): string {
  const coreMap: Record<string, string> = {
    fceumm: 'NES',
    snes9x: 'Super Nintendo',
    mupen64plus_next: 'Nintendo 64',
    mgba: 'Game Boy Advance',
    melonds: 'Nintendo DS',
    gambatte: 'Game Boy',
    beetle_vb: 'Virtual Boy',
    genesis_plus_gx: 'Sega Genesis',
    picodrive: 'Sega 32X',
    yabause: 'Sega Saturn',
    mednafen_psx_hw: 'PlayStation',
    ppsspp: 'PlayStation Portable',
    stella2014: 'Atari 2600',
    fbneo: 'Arcade',
    mame2003_plus: 'Arcade (MAME)',
  };

  return coreMap[core] || 'emulator';
}

/**
 * Format validation error messages
 */
export function formatValidationError(field: string, error: string): string {
  const friendlyFields: Record<string, string> = {
    username: 'Username',
    password: 'Password',
    email: 'Email',
    title: 'Game Title',
    name: 'Name',
    description: 'Description',
    rom: 'Game File',
    bios: 'BIOS File',
  };

  const friendlyField = friendlyFields[field.toLowerCase()] || field;

  // Common validation error patterns
  if (error.includes('required')) {
    return `${friendlyField} is required`;
  }
  if (error.includes('too short')) {
    return `${friendlyField} is too short`;
  }
  if (error.includes('too long')) {
    return `${friendlyField} is too long`;
  }
  if (error.includes('invalid')) {
    return `${friendlyField} format is invalid`;
  }
  if (error.includes('must be unique')) {
    return `${friendlyField} is already taken`;
  }

  return error;
}
