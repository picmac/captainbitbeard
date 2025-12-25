import { useState } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  requiresTyping?: boolean;
  confirmationText?: string;
  children?: React.ReactNode;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  type = 'danger',
  requiresTyping = false,
  confirmationText,
  children,
}: ConfirmationModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [understood, setUnderstood] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
      // Reset state
      setTypedText('');
      setUnderstood(false);
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    if (!isConfirming) {
      onClose();
      // Reset state
      setTypedText('');
      setUnderstood(false);
    }
  };

  const isConfirmDisabled = () => {
    if (isConfirming) return true;
    if (requiresTyping && confirmationText) {
      return typedText !== confirmationText;
    }
    if (type === 'danger' && !understood) {
      return true;
    }
    return false;
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          border: 'border-blood-red',
          bg: 'bg-blood-red/10',
          button: 'bg-blood-red hover:bg-blood-red/90',
        };
      case 'warning':
        return {
          border: 'border-pirate-gold',
          bg: 'bg-pirate-gold/10',
          button: 'bg-pirate-gold hover:bg-pirate-gold/90',
        };
      case 'info':
        return {
          border: 'border-ocean-blue',
          bg: 'bg-ocean-blue/10',
          button: 'bg-ocean-blue hover:bg-ocean-blue/90',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`w-full max-w-md border-4 ${styles.border} ${styles.bg} bg-sand-beige p-6`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-title"
          aria-describedby="confirmation-message"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <h2
              id="confirmation-title"
              className="text-pixel text-lg text-ocean-dark"
            >
              {title}
            </h2>
            <button
              onClick={handleClose}
              disabled={isConfirming}
              className="text-xl text-blood-red hover:text-blood-red/80 disabled:opacity-50"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Message */}
          <div
            id="confirmation-message"
            className="mb-6 text-pixel text-sm text-ocean-dark"
          >
            {message}
          </div>

          {/* Custom content (e.g., preview of what will be deleted) */}
          {children && (
            <div className="mb-6 border-2 border-wood-brown bg-white p-3">
              {children}
            </div>
          )}

          {/* Typing confirmation */}
          {requiresTyping && confirmationText && (
            <div className="mb-4">
              <label className="mb-2 block text-pixel text-xs text-wood-brown">
                Type "{confirmationText}" to confirm:
              </label>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                disabled={isConfirming}
                className="w-full border-2 border-wood-brown bg-white p-2 text-pixel text-xs text-ocean-dark disabled:opacity-50"
                autoFocus
                aria-label={`Type ${confirmationText} to confirm`}
              />
            </div>
          )}

          {/* Understanding checkbox for dangerous actions */}
          {type === 'danger' && !requiresTyping && (
            <div className="mb-4">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  disabled={isConfirming}
                  className="mt-1"
                  aria-label="I understand this action cannot be undone"
                />
                <span className="text-pixel text-xs text-blood-red">
                  I understand this action cannot be undone
                </span>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <button
              onClick={handleConfirm}
              disabled={isConfirmDisabled()}
              className={`btn-retro w-full text-xs sm:w-auto ${styles.button} disabled:cursor-not-allowed disabled:opacity-50`}
              aria-label={confirmText}
            >
              {isConfirming ? 'CONFIRMING...' : confirmText}
            </button>
            <button
              onClick={handleClose}
              disabled={isConfirming}
              className="btn-retro w-full bg-wood-brown text-xs hover:bg-wood-brown/90 disabled:opacity-50 sm:w-auto"
              aria-label={cancelText}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
