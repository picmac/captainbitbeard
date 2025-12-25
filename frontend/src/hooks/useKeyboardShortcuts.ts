import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '../utils/toast';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  global?: boolean; // If true, works even when input is focused
}

interface UseKeyboardShortcutsOptions {
  shortcuts?: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Global keyboard shortcuts hook
 * Provides navigation and quick actions throughout the app
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { shortcuts = [], enabled = true } = options;
  const navigate = useNavigate();
  const location = useLocation();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Custom shortcuts take priority
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          // Only execute if global or not in input
          if (shortcut.global || !isInput) {
            event.preventDefault();
            shortcut.action();
            return;
          }
        }
      }

      // Global shortcuts (only when not typing in input)
      if (!isInput) {
        switch (event.key.toLowerCase()) {
          case 'g':
            if (event.shiftKey) {
              // Shift+G - Go to library
              event.preventDefault();
              navigate('/');
            }
            break;

          case 'c':
            if (event.shiftKey) {
              // Shift+C - Go to collections
              event.preventDefault();
              navigate('/collections');
            }
            break;

          case 's':
            if (event.shiftKey) {
              // Shift+S - Go to save states
              event.preventDefault();
              navigate('/save-states');
            }
            break;

          case 'p':
            if (event.shiftKey) {
              // Shift+P - Go to profile
              event.preventDefault();
              navigate('/profile');
            }
            break;

          case 'a':
            if (event.shiftKey) {
              // Shift+A - Go to admin (if accessible)
              event.preventDefault();
              navigate('/admin');
            }
            break;

          case '/':
            // Focus search bar
            event.preventDefault();
            const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
            break;

          case 'escape':
            // Close modals/unfocus inputs
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
            break;

          case '?':
            if (event.shiftKey) {
              // Show keyboard shortcuts help
              event.preventDefault();
              showShortcutsHelp();
            }
            break;
        }
      }

      // Always available shortcuts (even in inputs)
      if (event.key === 'Escape') {
        // Escape - blur active element
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    },
    [enabled, shortcuts, navigate, location]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
}

// Show keyboard shortcuts help modal
function showShortcutsHelp() {
  const helpText = `
⌨️ KEYBOARD SHORTCUTS

NAVIGATION:
  Shift+G     → Library
  Shift+C     → Collections
  Shift+S     → Save States
  Shift+P     → Profile
  Shift+A     → Admin Panel

ACTIONS:
  /           → Focus Search
  Escape      → Close/Unfocus
  Shift+?     → Show this help

GAME LIBRARY:
  Arrow Keys  → Navigate games
  Enter       → Open selected game
  Space       → Play selected game
  F           → Toggle favorite
  `;

  toast.info('Keyboard Shortcuts', helpText);
}

/**
 * Hook for grid/list navigation with arrow keys
 */
export function useGridNavigation(options: {
  itemCount: number;
  columns?: number;
  onSelect?: (index: number) => void;
  onActivate?: (index: number) => void;
}) {
  const { itemCount, columns = 6, onSelect, onActivate } = options;

  useEffect(() => {
    let selectedIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only work when not in input
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInput) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, itemCount - 1);
          onSelect?.(selectedIndex);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, 0);
          onSelect?.(selectedIndex);
          break;

        case 'ArrowDown':
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + columns, itemCount - 1);
          onSelect?.(selectedIndex);
          break;

        case 'ArrowUp':
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - columns, 0);
          onSelect?.(selectedIndex);
          break;

        case 'Enter':
          e.preventDefault();
          onActivate?.(selectedIndex);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itemCount, columns, onSelect, onActivate]);
}
