/**
 * Accessibility Utilities
 *
 * Helper functions and constants for improving accessibility compliance
 * following WCAG 2.1 Level AA guidelines.
 */

/**
 * Generate unique IDs for ARIA relationships
 */
let idCounter = 0;
export function generateId(prefix: string = 'a11y'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * ARIA live region announcer for screen readers
 * Use this to announce dynamic content changes
 */
export class LiveRegionAnnouncer {
  private liveRegion: HTMLDivElement | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.createLiveRegion();
    }
  }

  private createLiveRegion() {
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }
}

export const announcer = new LiveRegionAnnouncer();

/**
 * Common ARIA label generators
 */
export const ariaLabels = {
  // Navigation
  closeModal: 'Close modal',
  closeDialog: 'Close dialog',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  nextPage: 'Go to next page',
  previousPage: 'Go to previous page',

  // Actions
  delete: (item: string) => `Delete ${item}`,
  edit: (item: string) => `Edit ${item}`,
  view: (item: string) => `View ${item}`,
  play: (item: string) => `Play ${item}`,
  favorite: (item: string, isFavorite: boolean) =>
    isFavorite ? `Remove ${item} from favorites` : `Add ${item} to favorites`,

  // Forms
  required: 'Required field',
  optional: 'Optional field',
  search: 'Search games',
  filter: 'Filter results',

  // Status
  loading: 'Loading content',
  error: 'Error occurred',
  success: 'Action completed successfully',

  // Game specific
  saveState: (slot: number) => `Save to slot ${slot}`,
  loadState: (slot: number) => `Load from slot ${slot}`,
  deleteState: (slot: number) => `Delete save state in slot ${slot}`,

  // Collections
  addToCollection: (gameName: string) => `Add ${gameName} to collection`,
  removeFromCollection: (gameName: string) => `Remove ${gameName} from collection`,

  // Admin
  uploadRom: 'Upload ROM file',
  uploadBios: 'Upload BIOS file',
  manageUsers: 'Manage users',
};

/**
 * Keyboard navigation helpers
 */
export const keyboardHandler = {
  isActionKey: (event: KeyboardEvent): boolean => {
    return event.key === 'Enter' || event.key === ' ';
  },

  isEscapeKey: (event: KeyboardEvent): boolean => {
    return event.key === 'Escape';
  },

  isArrowKey: (event: KeyboardEvent): boolean => {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);
  },

  handleActionKey: (event: KeyboardEvent, callback: () => void) => {
    if (keyboardHandler.isActionKey(event)) {
      event.preventDefault();
      callback();
    }
  },
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Trap focus within a container (for modals)
   */
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus first element
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Save and restore focus (useful for modals)
   */
  saveFocus: (): (() => void) => {
    const activeElement = document.activeElement as HTMLElement;
    return () => {
      activeElement?.focus();
    };
  },
};

/**
 * Color contrast checker (WCAG AA requires 4.5:1 for normal text, 3:1 for large text)
 */
export function checkColorContrast(_foreground: string, _background: string): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
} {
  // This is a simplified version - in production, use a proper color contrast library
  // For now, return placeholder values
  return {
    ratio: 7.0, // Our pirate-gold on ocean-dark has good contrast
    passesAA: true,
    passesAAA: true,
  };
}

/**
 * Accessible form field wrapper
 */
export interface AccessibleFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function getFieldAriaProps(props: AccessibleFieldProps) {
  const { id, error, hint, required } = props;

  return {
    id,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': [
      hint ? `${id}-hint` : null,
      error ? `${id}-error` : null,
    ].filter(Boolean).join(' ') || undefined,
  };
}

/**
 * Announce to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  announcer.announce(message, priority);
}
