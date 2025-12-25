# Accessibility Implementation Guide
**For Developers - Quick Reference**
**Last Updated:** December 24, 2025

---

## 🎯 Quick Checklist for New Components

Before merging any new component, verify:

- [ ] All images have `alt` text
- [ ] Interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] ARIA labels on icon-only buttons
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Form inputs have associated `<label>` elements
- [ ] Color is not the only indicator of state
- [ ] Minimum 44x44px touch targets

---

## 📝 Image Alt Text Guidelines

### Decision Tree: What Alt Text to Use?

```
Is the image decorative (pure visual design)?
├─ YES → Use empty alt: alt=""
└─ NO → Does it convey important information?
    ├─ YES → Describe the information: alt="Mario running through level 1-1"
    └─ NO → Does it have a function (button/link)?
        ├─ YES → Describe the function: alt="Play game"
        └─ NO → Describe the content: alt="Super Mario Bros cover art"
```

### Examples for Captain Bitbeard:

#### Game Covers
```tsx
// Good
<img src={game.coverUrl} alt={`${game.title} cover art`} />

// Bad
<img src={game.coverUrl} alt="game" />
<img src={game.coverUrl} alt="" /> // Only if truly decorative
```

#### Screenshots
```tsx
// Good
<img src={screenshot.url} alt={`${game.title} screenshot showing ${screenshot.category}`} />

// Example
<img src={screenshot.url} alt="Super Mario Bros screenshot showing level 1-1 gameplay" />

// Bad
<img src={screenshot.url} alt="screenshot" />
```

#### User Avatars
```tsx
// Good
<img src={user.avatarUrl} alt={`${user.username}'s avatar`} />

// Bad
<img src={user.avatarUrl} alt="avatar" />
```

#### BIOS Files / System Logos
```tsx
// Good
<img src="/logos/ps1.png" alt="PlayStation 1" />

// Bad
<img src="/logos/ps1.png" alt="logo" />
```

#### Decorative Images
```tsx
// Decorative pirate flag
<img src="/decorations/flag.svg" alt="" aria-hidden="true" />

// Background patterns
<div style={{ backgroundImage: 'url(...)' }} role="presentation" />
```

---

## 🎨 Heading Hierarchy Rules

### The Principle
Each page should have **ONE h1** and headings should follow a logical order without skipping levels.

### Correct Hierarchy

```tsx
<h1>Game Library</h1>              // Page title
  <h2>Featured Games</h2>           // Major section
    <h3>Action Games</h3>           // Subsection
    <h3>RPG Games</h3>              // Subsection
  <h2>Recently Played</h2>          // Major section
    <h3>Today</h3>                  // Subsection
```

### Incorrect Hierarchy

```tsx
<h1>Game Library</h1>
  <h3>Featured Games</h3>    // ❌ Skipped h2
  <h2>Action Games</h2>      // ❌ Out of order
<h1>Collections</h1>         // ❌ Two h1s on same page
```

### Captain Bitbeard Page Structure

#### GameLibraryPage
```tsx
<h1>🎮 TREASURE CHEST</h1>               // Page title
  <h2 className="sr-only">Search and Filters</h2>  // Section (can be visually hidden)
  <h2>Continue Playing</h2>               // Component section
  <h2>Your Games</h2>                     // Main content
    <h3>Filter by System</h3>             // Optional subsection
```

#### GameDetailsPage
```tsx
<h1>{game.title}</h1>                    // Game name as page title
  <h2>Game Information</h2>               // Details section
  <h2>Screenshots</h2>                    // Screenshots section
  <h2>Save States</h2>                    // Save states section
```

#### CollectionsPage
```tsx
<h1>📚 MY COLLECTIONS</h1>               // Page title
  <h2>Create New Collection</h2>          // Action section
  <h2>Your Collections</h2>               // List section
```

### Utility: Visually Hidden Headings

When you need a heading for screen readers but not visually:

```tsx
<h2 className="sr-only">Navigation</h2>
```

---

## ⌨️ Keyboard Accessibility

### Interactive Elements

All of these must be keyboard accessible:

```tsx
// ✅ Native button - automatically accessible
<button onClick={handleClick}>Click Me</button>

// ❌ Div with onClick - NOT accessible
<div onClick={handleClick}>Click Me</div>

// ✅ Div made accessible (if you must use div)
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click Me
</div>
```

### Focus Management in Modals

```tsx
import { focusManagement } from '../utils/accessibility';

function MyModal({ isOpen, onClose }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Save current focus
      const restoreFocus = focusManagement.saveFocus();

      // Trap focus in modal
      const releaseTrap = focusManagement.trapFocus(modalRef.current);

      return () => {
        releaseTrap();    // Release focus trap
        restoreFocus();   // Restore previous focus
      };
    }
  }, [isOpen]);

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  );
}
```

---

## 🏷️ ARIA Labels

### When to Use ARIA Labels

#### Icon-Only Buttons
```tsx
// ❌ Bad - no label
<button onClick={handleDelete}>🗑️</button>

// ✅ Good - has aria-label
<button onClick={handleDelete} aria-label={ariaLabels.delete(game.title)}>
  🗑️
</button>
```

#### Custom Components
```tsx
// Search input
<input
  type="text"
  aria-label="Search games"
  placeholder="Search..."
/>

// Toggle button
<button
  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
  aria-pressed={isFavorite}
>
  {isFavorite ? '❤️' : '🤍'}
</button>
```

### Using the ARIA Utilities

```tsx
import { ariaLabels } from '../utils/accessibility';

// Delete button
<button aria-label={ariaLabels.delete('Super Mario 64')}>
  🗑️
</button>

// Favorite button
<button aria-label={ariaLabels.favorite('Sonic', isFavorite)}>
  {isFavorite ? '❤️' : '🤍'}
</button>

// Save state button
<button aria-label={ariaLabels.saveState(3)}>
  💾 Slot 3
</button>
```

---

## 🎬 Live Regions (Dynamic Content)

### When to Announce

Use live regions when content changes without page reload:

- Game added to collection
- Save state created
- Search results updated
- Errors occur

### How to Use

```tsx
import { announce } from '../utils/accessibility';

// Polite announcement (doesn't interrupt)
const handleAddToCollection = async () => {
  await addGameToCollection(gameId, collectionId);
  announce('Game added to collection', 'polite');
};

// Assertive announcement (interrupts screen reader)
const handleError = (error: Error) => {
  announce('Error: ' + error.message, 'assertive');
};
```

### Already Implemented

Our toast notifications automatically announce to screen readers via ARIA live regions, so you don't need to call `announce()` when using `toast.success()` or `toast.error()`.

---

## 📋 Form Accessibility

### Complete Form Example

```tsx
import { getFieldAriaProps } from '../utils/accessibility';

function MyForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const fieldProps = getFieldAriaProps({
    id: 'email',
    label: 'Email Address',
    error: error,
    hint: 'We will never share your email',
    required: true,
  });

  return (
    <form>
      <label htmlFor="email" className="required-field">
        Email Address
      </label>
      <input
        {...fieldProps}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      {error && (
        <div id="email-error" className="field-error">
          {error}
        </div>
      )}
      <div id="email-hint" className="field-hint">
        We will never share your email
      </div>
    </form>
  );
}
```

### Autocomplete Attributes

Always use autocomplete for common fields:

```tsx
// Login forms
<input name="username" autoComplete="username" />
<input name="password" type="password" autoComplete="current-password" />

// Registration
<input name="email" autoComplete="email" />
<input name="password" type="password" autoComplete="new-password" />

// Profile
<input name="name" autoComplete="name" />
<input name="photo" autoComplete="photo" />
```

[Full list](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill)

---

## 🎨 Color & Contrast

### Required Ratios

- **Normal text (< 18pt):** 4.5:1
- **Large text (≥ 18pt or 14pt bold):** 3:1
- **UI components & focus indicators:** 3:1

### Our Color Palette (Pre-verified)

All these combinations meet WCAG AA:

| Foreground | Background | Ratio | Usage |
|------------|------------|-------|-------|
| #ffd700 (pirate-gold) | #1a2332 (ocean-dark) | 12:1 ✅ | Primary text |
| #f5e6d3 (skull-white) | #1a2332 (ocean-dark) | 11:1 ✅ | Body text |
| #8b4513 (wood-brown) | #e8d5b7 (sand-beige) | 5:1 ✅ | Secondary text |
| #dc143c (blood-red) | #f5e6d3 (skull-white) | 6:1 ✅ | Errors |

### Don't Use Color Alone

```tsx
// ❌ Bad - color only
<span style={{ color: 'red' }}>Error</span>

// ✅ Good - icon + color
<span className="text-blood-red">❌ Error</span>

// ✅ Good - text + color
<span className="text-blood-red font-bold">Error:</span> Message here
```

---

## 📱 Touch Targets

### Minimum Size: 44x44 pixels

```tsx
// ❌ Too small
<button className="px-1 py-1 text-xs">×</button>

// ✅ Meets minimum
<button className="px-3 py-3 text-xs">×</button>

// ✅ Using our classes (already sized correctly)
<button className="btn-retro">CLICK ME</button>
```

### Spacing Between Targets

Ensure at least 8px spacing between clickable elements:

```tsx
// ✅ Good spacing
<div className="flex gap-2">
  <button>Button 1</button>
  <button>Button 2</button>
</div>
```

---

## 🧪 Testing Your Component

### Manual Tests

1. **Keyboard Only**
   - Unplug your mouse
   - Tab through your component
   - Verify all actions work with keyboard

2. **Focus Indicators**
   - Tab to each element
   - Verify gold outline is visible
   - Check contrast is 3:1+

3. **Screen Reader** (Optional but recommended)
   - Install NVDA (Windows, free)
   - Navigate your component
   - Verify all content is announced

### Automated Tests

```bash
# Run axe DevTools in browser
# Right-click → Inspect → Axe DevTools tab → Scan

# Or use our built-in test (coming soon)
npm run test:a11y
```

---

## ✅ Component Checklist

Before you submit a PR, verify:

### Structural
- [ ] One h1 per page
- [ ] Headings in order (no skipped levels)
- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`)
- [ ] Proper landmarks (main, nav, aside)

### Interactive
- [ ] All buttons are `<button>` or have role="button"
- [ ] All buttons work with Enter/Space keys
- [ ] Focus order is logical
- [ ] Focus indicators visible (3px gold outline)
- [ ] No keyboard traps

### Content
- [ ] All images have alt text
- [ ] Icon-only buttons have aria-label
- [ ] Form inputs have `<label>` elements
- [ ] Error messages linked via aria-describedby
- [ ] Loading states announced to screen readers

### Visual
- [ ] Text has 4.5:1 contrast (or 3:1 if large)
- [ ] Focus indicators have 3:1 contrast
- [ ] Touch targets are 44x44px minimum
- [ ] Color not the only indicator

### Dynamic
- [ ] Toast notifications used for success/error
- [ ] Live regions for dynamic updates
- [ ] Focus managed in modals/dialogs

---

## 📚 Quick Reference

### Utilities Available

```tsx
import {
  announce,              // Announce to screen readers
  ariaLabels,           // Pre-defined ARIA labels
  focusManagement,      // Focus trap & restore
  getFieldAriaProps,    // Form field ARIA attributes
  keyboardHandler,      // Keyboard event helpers
} from '../utils/accessibility';
```

### Components Available

```tsx
import { SkipToContent } from '../components/SkipToContent';
import { PageTitle } from '../components/PageTitle';
import { Tooltip } from '../components/Tooltip';
import { ConfirmationModal } from '../components/ConfirmationModal';
```

### CSS Classes Available

```css
.sr-only                /* Screen reader only */
.focus:not-sr-only      /* Visible on focus */
.required-field         /* Shows * after label */
.field-error            /* Error message styling */
.field-hint             /* Hint message styling */
.high-contrast-text     /* Force high contrast */
```

---

## 🎓 Learning Resources

- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices:** https://www.w3.org/WAI/ARIA/apg/
- **WebAIM Articles:** https://webaim.org/articles/
- **MDN Accessibility:** https://developer.mozilla.org/en-US/docs/Web/Accessibility

---

## 🚨 Common Mistakes to Avoid

1. **Using `<div>` as a button** - Use `<button>` instead
2. **No alt text on images** - Always provide alt (even if empty for decorative)
3. **Placeholder as label** - Use proper `<label>` elements
4. **Low contrast text** - Check with DevTools
5. **Skipping heading levels** - Go h1 → h2 → h3, not h1 → h3
6. **Color only indicators** - Add icons or text
7. **Keyboard traps** - Test with Tab key
8. **No focus indicators** - Our CSS handles this, but check!

---

**Remember:** Accessibility is not a feature, it's a requirement. Build it in from the start!

**Questions?** Check `ACCESSIBILITY_CHECKLIST.md` for complete WCAG 2.1 compliance details.
