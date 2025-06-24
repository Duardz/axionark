// src/lib/utils/security.ts

import DOMPurify from 'isomorphic-dompurify';

// Input sanitization functions
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'pre', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
}

export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .trim()
    .slice(0, 5000); // Limit length
}

export function sanitizeUsername(username: string): string {
  return username
    .replace(/[^a-zA-Z0-9_-]/g, '') // Only alphanumeric, underscore, and dash
    .trim()
    .slice(0, 50);
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Password validation
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Rate limiting
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitStore[key];
  
  if (!record || now > record.resetTime) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs
    };
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

// XSS prevention for dynamic content
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Validate bug bounty amount
export function validateBountyAmount(amount: number): boolean {
  return amount >= 0 && amount <= 1000000 && !isNaN(amount);
}

// Validate task XP
export function validateXP(xp: number): boolean {
  return xp >= 0 && xp <= 10000 && Number.isInteger(xp);
}

// Validate Firebase timestamp
export function isFirebaseTimestamp(date: any): boolean {
  return date && typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date;
}

// Convert Firebase timestamp to Date
export function firebaseTimestampToDate(timestamp: any): Date {
  if (isFirebaseTimestamp(timestamp)) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date(timestamp);
}

// CSRF token generation
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate CSRF token
export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length === 64;
}

// Content Security Policy headers
export const CSP_HEADERS = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim()
};

// Validate and sanitize search query
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .trim()
    .slice(0, 100); // Limit length
}

// Validate phase type
export function validatePhase(phase: string): phase is 'beginner' | 'intermediate' | 'advanced' {
  return ['beginner', 'intermediate', 'advanced'].includes(phase);
}

// Validate severity type
export function validateSeverity(severity: string): severity is 'low' | 'medium' | 'high' | 'critical' {
  return ['low', 'medium', 'high', 'critical'].includes(severity);
}

// Validate status type
export function validateStatus(status: string): status is 'reported' | 'triaged' | 'resolved' | 'duplicate' | 'rejected' {
  return ['reported', 'triaged', 'resolved', 'duplicate', 'rejected'].includes(status);
}

// Validate mood type
export function validateMood(mood: string): mood is 'great' | 'good' | 'okay' | 'bad' {
  return ['great', 'good', 'okay', 'bad'].includes(mood);
}

// Debounce function to prevent rapid fire events
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}