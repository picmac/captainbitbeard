/**
 * SkipToContent Component
 *
 * Provides a hidden "Skip to main content" link for keyboard and screen reader users.
 * This is a WCAG 2.1 Level A requirement (2.4.1 Bypass Blocks).
 *
 * The link is visually hidden but becomes visible when focused via keyboard (Tab key).
 */

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        skip-to-content
        sr-only
        focus:not-sr-only
        focus:absolute
        focus:top-4
        focus:left-4
        focus:z-50
        focus:px-4
        focus:py-2
        focus:bg-pirate-gold
        focus:text-ocean-dark
        focus:border-4
        focus:border-ocean-dark
        focus:text-pixel
        focus:text-sm
        focus:outline-none
        focus:ring-4
        focus:ring-treasure-green
      "
    >
      ⚓ SKIP TO MAIN CONTENT
    </a>
  );
}

/**
 * Screen reader only utility class (add to globals.css)
 * Hides content visually but keeps it accessible to screen readers
 */
export const srOnlyStyles = `
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
`;
