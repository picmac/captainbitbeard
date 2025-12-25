import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter - 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for uploads - 10 uploads per hour
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: 'Too many uploads from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Bulk upload limiter - 3 bulk uploads per hour
 */
export const bulkUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 bulk uploads per hour
  message: 'Too many bulk uploads from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Scraping limiter - 20 scrape requests per hour
 * (ScreenScraper API has its own limits)
 */
export const scrapeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 scrapes per hour
  message: 'Too many scrape requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Authentication limiter - 5 attempts per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  message: 'Too many login attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});
