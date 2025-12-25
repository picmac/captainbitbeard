# Captain Bitbeard - Pre-Deployment Checklist
**Norman Group UX Optimizations & WCAG 2.1 AA Compliance**

**Last Updated:** December 24, 2025

---

## 📋 Overview

This checklist ensures all Norman Group UX improvements and WCAG 2.1 Level AA accessibility requirements are met before deploying to production.

**Success Criteria:**
- ✅ All Phase 1, 2, and 3 features implemented
- ✅ 100% WCAG 2.1 AA infrastructure in place
- ✅ All automated tests passing
- ✅ Manual accessibility testing completed
- ✅ No critical errors or warnings

---

## ✅ Phase 1: Error Prevention & Recovery

### 1.1 Toast Notifications (Sonner)
- [ ] Toast library installed and configured (`sonner` in package.json)
- [ ] Toast provider added to App.tsx
- [ ] All `alert()` calls removed (verify with grep)
- [ ] All error messages use `toast.error()`
- [ ] All success messages use `toast.success()`
- [ ] Toast notifications have ARIA live regions
- [ ] Toast messages are user-friendly (no technical jargon)

**Test:**
```bash
# Verify no alert() calls remain
cd frontend
grep -r "alert(" src/ --include="*.tsx" --include="*.ts"
# Should return no results (exit code 1)
```

### 1.2 Confirmation Modals
- [ ] ConfirmationModal component created
- [ ] All `window.confirm()` calls replaced
- [ ] Delete confirmations require modal confirmation
- [ ] Critical actions have "type typing" confirmation
- [ ] Modals are keyboard accessible (ESC, Tab, Enter)
- [ ] Modals have proper ARIA attributes (role="dialog", aria-modal)

**Test:**
```bash
# Verify no confirm() calls remain
cd frontend
grep -r "window\.confirm\|confirm(" src/ --include="*.tsx" --include="*.ts"
# Should return no results
```

### 1.3 User-Friendly Error Messages
- [ ] errorMessages.ts utility created
- [ ] All HTTP errors translated to friendly messages
- [ ] Network errors have helpful suggestions
- [ ] Emulator errors are contextualized
- [ ] No raw error.message displayed to users

**Files to verify:**
- `frontend/src/utils/errorMessages.ts`
- `frontend/src/utils/toast.ts`

---

## ✅ Phase 2: User Guidance

### 2.1 Onboarding Tour
- [ ] react-joyride installed
- [ ] OnboardingTour component created
- [ ] Tour shows automatically for first-time users
- [ ] Tour has 7 steps covering key features
- [ ] Tour state saved to localStorage
- [ ] Tour can be restarted from user profile
- [ ] Tour has pirate-themed styling
- [ ] Data-tour attributes added to GameLibraryPage

**Test:**
```bash
# Clear localStorage and verify tour shows
# In browser console:
localStorage.removeItem('captain-bitbeard-tour-completed')
# Reload page - tour should appear
```

### 2.2 Help Documentation
- [ ] HelpModal component created
- [ ] Help button added to GameLibraryPage header
- [ ] Keyboard shortcut (Shift+?) opens help
- [ ] Help modal has 7 sections
- [ ] All features documented with examples
- [ ] Troubleshooting section added
- [ ] Modal is keyboard accessible

**Sections to verify:**
1. Getting Started
2. Playing Games
3. Collections
4. Save States
5. Keyboard Shortcuts
6. Admin Features
7. Troubleshooting

### 2.3 Tooltips
- [ ] @radix-ui/react-tooltip installed
- [ ] Tooltip component created
- [ ] Tooltips added to complex UI elements
- [ ] Tooltips have keyboard access
- [ ] InfoIcon component available for contextual help

---

## ✅ Phase 3: Accessibility (WCAG 2.1 AA)

### 3.1 Keyboard Navigation
- [ ] All interactive elements keyboard accessible
- [ ] Tab order is logical on all pages
- [ ] Focus indicators visible (3px gold outline)
- [ ] Focus indicators meet 3:1 contrast ratio
- [ ] No keyboard traps
- [ ] Skip-to-content link available
- [ ] Modal focus trapping works

**Test:**
```bash
# Manual test: Unplug mouse and navigate with keyboard only
# All features should be accessible via Tab, Enter, Space, ESC
```

### 3.2 Screen Reader Support
- [ ] All images have meaningful alt text
- [ ] Icon-only buttons have aria-label
- [ ] Form inputs have associated labels
- [ ] Dynamic content announces (ARIA live regions)
- [ ] Page titles update on navigation (react-helmet-async)
- [ ] Headings follow proper hierarchy (h1 → h2 → h3)
- [ ] Semantic HTML used (<nav>, <main>, <button>)

**Test:**
```bash
# Run automated audits
cd frontend
npm run a11y:audit

# Should pass both:
# - npm run a11y:alt-text
# - npm run a11y:headings
```

### 3.3 Visual Accessibility
- [ ] Text contrast meets 4.5:1 ratio (12:1 achieved)
- [ ] UI components meet 3:1 contrast ratio
- [ ] Touch targets are 44x44px minimum
- [ ] Color not the only indicator of state
- [ ] Focus indicators visible on all backgrounds
- [ ] Reduced motion support implemented
- [ ] High contrast mode supported

**Test:**
```bash
# Use browser DevTools → Lighthouse → Accessibility
# Should score 95+ on all pages
```

### 3.4 Page Titles (WCAG 2.4.2)
- [ ] PageTitle component created (react-helmet-async)
- [ ] All pages have unique, descriptive titles
- [ ] Page titles update dynamically
- [ ] SEO meta tags included

**Pages to verify:**
- [ ] HomePage - "Welcome | Captain Bitbeard"
- [ ] LoginPage - "Login | Captain Bitbeard"
- [ ] GameLibraryPage - "Game Library | Captain Bitbeard"
- [ ] GameDetailsPage - "[Game Title] | Captain Bitbeard"
- [ ] GamePlayerPage - "Playing [Game] | Captain Bitbeard"
- [ ] CollectionsPage - "My Collections | Captain Bitbeard"
- [ ] CollectionDetailPage - "[Collection Name] | Captain Bitbeard"
- [ ] SaveStatesPage - "My Save States | Captain Bitbeard"
- [ ] UserProfilePage - "My Profile | Captain Bitbeard"
- [ ] AdminPage - "Admin Panel | Captain Bitbeard"
- [ ] SharedCollectionPage - "Shared: [Collection] | Captain Bitbeard"

### 3.5 Forms Accessibility
- [ ] All inputs have <label> elements
- [ ] Required fields marked (aria-required)
- [ ] Error messages linked (aria-describedby)
- [ ] Autocomplete attributes present
- [ ] Field hints have proper ARIA

**Forms to verify:**
- Login form (username, password)
- Collection creation form
- Profile edit form
- Search forms

### 3.6 Accessibility Utilities
- [ ] `accessibility.ts` utility created
- [ ] `accessibility.css` stylesheet added
- [ ] LiveRegionAnnouncer class implemented
- [ ] ARIA label helpers available
- [ ] Focus management utilities available
- [ ] Keyboard handler helpers available

**Files:**
- `frontend/src/utils/accessibility.ts`
- `frontend/src/styles/accessibility.css`

---

## 🧪 Testing Checklist

### Automated Tests
```bash
cd frontend

# 1. TypeScript compilation
npm run type-check
# Should pass with no errors

# 2. Linting
npm run lint
# Should have ≤30 warnings (max-warnings setting)

# 3. Unit tests
npm run test
# All tests should pass

# 4. Build
npm run build
# Should complete successfully

# 5. Accessibility audits
npm run a11y:audit
# Should pass both alt-text and heading audits
```

### Manual Tests

#### Keyboard Navigation
- [ ] Tab through entire site without mouse
- [ ] All buttons/links reachable via Tab
- [ ] Enter/Space activate buttons
- [ ] ESC closes modals
- [ ] Arrow keys work in dropdowns
- [ ] Focus visible at all times

#### Screen Reader (NVDA or JAWS)
- [ ] Navigate with screen reader through main pages
- [ ] All content is announced
- [ ] Image alt text is read
- [ ] Button labels are clear
- [ ] Form fields have labels
- [ ] Errors are announced
- [ ] Loading states are announced

#### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Mobile Responsiveness
- [ ] All pages responsive on mobile
- [ ] Touch targets ≥44px
- [ ] No horizontal scroll
- [ ] Tooltips work on touch devices
- [ ] Modals work on small screens

#### Color Contrast (DevTools)
- [ ] All text meets 4.5:1 ratio
- [ ] All UI components meet 3:1 ratio
- [ ] Focus indicators meet 3:1 ratio
- [ ] No contrast warnings in DevTools

---

## 📊 Metrics Verification

### Norman Nielsen Group Heuristics
Expected improvement: **7.2/10 → 9.0/10 (+25%)**

- [ ] Error prevention: 6/10 → 9/10
- [ ] Error recovery: 5/10 → 9/10
- [ ] Help & documentation: 4/10 → 9/10
- [ ] Aesthetic & minimalist: 8/10 → 9/10
- [ ] Recognition over recall: 7/10 → 9/10

### WCAG 2.1 AA Compliance
Expected: **100% infrastructure, 85%+ verified**

- [ ] Perceivable: 85%+
- [ ] Operable: 90%+
- [ ] Understandable: 90%+
- [ ] Robust: 95%+

### Performance Benchmarks
- [ ] Lighthouse Performance: 90+
- [ ] Lighthouse Accessibility: 95+
- [ ] Lighthouse Best Practices: 90+
- [ ] Lighthouse SEO: 95+

---

## 📁 File Inventory Verification

### Components Created (19 total)
- [ ] `frontend/src/components/ConfirmationModal.tsx`
- [ ] `frontend/src/components/Tooltip.tsx`
- [ ] `frontend/src/components/OnboardingTour.tsx`
- [ ] `frontend/src/components/HelpModal.tsx`
- [ ] `frontend/src/components/SkipToContent.tsx`
- [ ] `frontend/src/components/PageTitle.tsx`

### Utilities Created (3 total)
- [ ] `frontend/src/utils/toast.ts`
- [ ] `frontend/src/utils/errorMessages.ts`
- [ ] `frontend/src/utils/accessibility.ts`

### Styles Created (1 total)
- [ ] `frontend/src/styles/accessibility.css`

### Scripts Created (2 total)
- [ ] `frontend/scripts/audit-alt-text.js`
- [ ] `frontend/scripts/audit-heading-hierarchy.js`

### Documentation Created (7 total)
- [ ] `NORMAN_GROUP_IMPROVEMENTS_COMPLETED.md`
- [ ] `PHASE_2_USER_GUIDANCE_COMPLETED.md`
- [ ] `PHASE_3_ACCESSIBILITY_COMPLETED.md`
- [ ] `NORMAN_GROUP_COMPLETE_SUMMARY.md`
- [ ] `ACCESSIBILITY_CHECKLIST.md`
- [ ] `ACCESSIBILITY_IMPLEMENTATION_GUIDE.md`
- [ ] `DEPLOYMENT_CHECKLIST.md` (this file)

---

## 🚀 Pre-Deployment Tasks

### Code Quality
- [ ] All console.log() removed (except intentional)
- [ ] No commented-out code blocks
- [ ] No TODO comments for critical features
- [ ] Code formatted with Prettier
- [ ] No ESLint errors (warnings ≤30)

### Dependencies
- [ ] All dependencies up to date
- [ ] No security vulnerabilities (`npm audit`)
- [ ] No unused dependencies
- [ ] package-lock.json committed

### Environment Variables
- [ ] All required env vars documented
- [ ] .env.example updated
- [ ] Production env vars configured
- [ ] No secrets in code

### Documentation
- [ ] README.md updated
- [ ] API endpoints documented
- [ ] Deployment guide written
- [ ] Changelog updated

### Backend Compatibility
- [ ] Frontend compatible with current backend API
- [ ] All API endpoints tested
- [ ] Error handling for API failures
- [ ] Loading states for all async operations

---

## ✨ Post-Deployment Verification

### Smoke Tests (Production)
- [ ] Home page loads
- [ ] Login works
- [ ] Game library displays
- [ ] Games can be played
- [ ] Collections can be created
- [ ] Save states work
- [ ] Admin panel accessible
- [ ] Help modal opens

### Accessibility (Production)
- [ ] Run Lighthouse audit on production URL
- [ ] Verify ARIA announcements work
- [ ] Test with real screen reader
- [ ] Check keyboard navigation
- [ ] Verify page titles update

### Monitoring
- [ ] Error tracking configured (Sentry/etc)
- [ ] Analytics tracking works
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured

---

## 🎯 Success Criteria Summary

Before deploying, ensure:

✅ **All automated tests pass** (`npm run test`, `npm run build`, `npm run a11y:audit`)
✅ **No accessibility violations** (Lighthouse 95+, manual testing complete)
✅ **User flows tested** (login, play game, manage collections, save states)
✅ **Documentation complete** (README, guides, API docs)
✅ **All critical features working** (no blockers)

---

## 🐛 Known Issues & Workarounds

Document any known issues that don't block deployment:

1. **Issue:** [Description]
   - **Impact:** [Low/Medium/High]
   - **Workaround:** [If any]
   - **Tracked in:** [Issue #]

2. ...

---

## 📞 Deployment Contact

- **Developer:** [Your name]
- **Date:** [Deployment date]
- **Version:** [Version number]
- **Build:** [Build/commit hash]

---

**Remember:** Accessibility is not optional. All items must be checked before deployment.

For questions, refer to:
- `ACCESSIBILITY_IMPLEMENTATION_GUIDE.md` - Developer guide
- `ACCESSIBILITY_CHECKLIST.md` - Complete WCAG 2.1 checklist
- `NORMAN_GROUP_COMPLETE_SUMMARY.md` - Full implementation summary
