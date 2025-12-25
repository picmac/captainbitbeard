/**
 * PageTitle Component
 *
 * Sets the document title for each page using react-helmet-async
 * Ensures WCAG 2.4.2 (Page Titled) compliance
 */

import { Helmet } from 'react-helmet-async';

interface PageTitleProps {
  title: string;
  description?: string;
}

export function PageTitle({ title, description }: PageTitleProps) {
  const fullTitle = `${title} | Captain Bitbeard`;
  const defaultDescription = 'Ahoy! Your retro gaming treasure chest - play classic games from Nintendo, Sega, PlayStation, and more in your browser.';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />

      {/* Open Graph / Social Media */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
    </Helmet>
  );
}

/**
 * Usage in pages:
 *
 * <PageTitle
 *   title="Game Library"
 *   description="Browse your retro game collection"
 * />
 */
