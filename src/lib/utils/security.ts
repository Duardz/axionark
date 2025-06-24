// src/lib/utils/security.ts - Enhanced version

import DOMPurify from 'isomorphic-dompurify';

// Input sanitization functions
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'pre', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    FORBID_CONTENTS: ['script', 'style'],
    FORBID_TAGS: ['input', 'form', 'textarea'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  });
}

export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 5000); // Limit length
}

export function sanitizeUsername(username: string): string {
  return username
    .replace(/[^a-zA-Z0-9_-]/g, '') // Only alphanumeric, underscore, and dash
    .trim()
    .slice(0, 50);
}

// Email validation (more strict)
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const suspiciousPatterns = [
    'script',
    'javascript:',
    'onerror',
    '<',
    '>',
    'onclick'
  ];
  
  const lowercaseEmail = email.toLowerCase();
  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => 
    lowercaseEmail.includes(pattern)
  );
  
  return emailRegex.test(email) && 
         email.length <= 254 && 
         !hasSuspiciousPattern &&
         !email.includes('..') && // No consecutive dots
         !email.startsWith('.') && // No dot at start
         !email.endsWith('.'); // No dot at end
}

// Password validation (enhanced)
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
  
  // Check for common weak patterns
  const commonPasswords = ['password', '12345678', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password contains common weak patterns');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Enhanced rate limiting with IP tracking
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    ips?: Set<string>;
  };
}

const rateLimitStore: RateLimitStore = {};

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000,
  ip?: string
): boolean {
  const now = Date.now();
  const record = rateLimitStore[key];
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    cleanupRateLimitStore();
  }
  
  if (!record || now > record.resetTime) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs,
      ips: ip ? new Set([ip]) : undefined
    };
    return true;
  }
  
  // Check IP diversity (if tracking IPs)
  if (ip && record.ips) {
    record.ips.add(ip);
    if (record.ips.size > limit * 2) { // Suspicious if too many different IPs
      return false;
    }
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

function cleanupRateLimitStore() {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}

// XSS prevention for dynamic content
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return text.replace(/[&<>"'`=\/]/g, (m) => map[m]);
}

// Validate bug bounty amount with more checks
export function validateBountyAmount(amount: number): boolean {
  return amount >= 0 && 
         amount <= 1000000 && 
         !isNaN(amount) &&
         Number.isFinite(amount) &&
         Number.isSafeInteger(amount * 100); // Check cents precision
}

// Validate task XP (enhanced)
export function validateXP(xp: number): boolean {
  return xp >= 0 && 
         xp <= 10000 && 
         Number.isInteger(xp) &&
         !isNaN(xp) &&
         Number.isFinite(xp);
}

// Validate Firebase timestamp
export function isFirebaseTimestamp(date: any): boolean {
  return date && 
         typeof date === 'object' && 
         'seconds' in date && 
         'nanoseconds' in date &&
         typeof date.seconds === 'number' &&
         typeof date.nanoseconds === 'number';
}

// Convert Firebase timestamp to Date (safer)
export function firebaseTimestampToDate(timestamp: any): Date {
  if (isFirebaseTimestamp(timestamp)) {
    const date = new Date(timestamp.seconds * 1000);
    // Validate the date is reasonable (not too far in past or future)
    const now = Date.now();
    const dateTime = date.getTime();
    const yearInMs = 365 * 24 * 60 * 60 * 1000;
    
    if (dateTime > now + yearInMs || dateTime < now - (10 * yearInMs)) {
      return new Date(); // Return current date if suspicious
    }
    return date;
  }
  
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  return new Date();
}

// CSRF token generation (enhanced)
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
  // Add timestamp to token for additional validation
  const timestamp = Date.now().toString(36);
  return `${token}-${timestamp}`;
}

// Validate CSRF token (enhanced)
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  
  const [tokenPart, timestamp] = token.split('-');
  const [storedTokenPart, storedTimestamp] = storedToken.split('-');
  
  // Check token match
  if (tokenPart !== storedTokenPart) return false;
  
  // Check timestamp (token should not be older than 1 hour)
  if (timestamp && storedTimestamp) {
    const tokenAge = Date.now() - parseInt(storedTimestamp, 36);
    if (tokenAge > 3600000) return false; // 1 hour
  }
  
  return true;
}

// Enhanced Content Security Policy headers
export const CSP_HEADERS = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://apis.google.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self' data:;
    connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    block-all-mixed-content;
  `.replace(/\s+/g, ' ').trim()
};

// Validate and sanitize search query (enhanced)
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .slice(0, 100); // Limit length
}

// Type validators with additional checks
export function validatePhase(phase: string): phase is 'beginner' | 'intermediate' | 'advanced' {
  return ['beginner', 'intermediate', 'advanced'].includes(phase) &&
         phase.length <= 20 && // Reasonable length
         /^[a-z]+$/.test(phase); // Only lowercase letters
}

export function validateSeverity(severity: string): severity is 'low' | 'medium' | 'high' | 'critical' {
  return ['low', 'medium', 'high', 'critical'].includes(severity) &&
         severity.length <= 10 &&
         /^[a-z]+$/.test(severity);
}

export function validateStatus(status: string): status is 'reported' | 'triaged' | 'resolved' | 'duplicate' | 'rejected' {
  return ['reported', 'triaged', 'resolved', 'duplicate', 'rejected'].includes(status) &&
         status.length <= 20 &&
         /^[a-z]+$/.test(status);
}

export function validateMood(mood: string): mood is 'great' | 'good' | 'okay' | 'bad' {
  return ['great', 'good', 'okay', 'bad'].includes(mood) &&
         mood.length <= 10 &&
         /^[a-z]+$/.test(mood);
}

// Enhanced debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean; maxWait?: number }
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  let leading = options?.leading ?? false;
  let trailing = options?.trailing ?? true;
  let maxWait = options?.maxWait;
  
  function invokeFunc(time: number) {
    const args = lastArgs;
    lastArgs = null;
    lastInvokeTime = time;
    if (args) {
      func(...args);
    }
  }
  
  function leadingEdge(time: number) {
    lastInvokeTime = time;
    timeout = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : undefined;
  }
  
  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeout = setTimeout(timerExpired, remainingWait(time));
  }
  
  function trailingEdge(time: number) {
    timeout = null;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = null;
  }
  
  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = lastCallTime ? time - lastCallTime : 0;
    const timeSinceLastInvoke = time - lastInvokeTime;
    
    return !lastCallTime || 
           timeSinceLastCall >= wait ||
           timeSinceLastCall < 0 ||
           (maxWait !== undefined && timeSinceLastInvoke >= maxWait);
  }
  
  function remainingWait(time: number): number {
    const timeSinceLastCall = lastCallTime ? time - lastCallTime : 0;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;
    
    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }
  
  return (...args: Parameters<T>) => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastCallTime = time;
    
    if (isInvoking) {
      if (!timeout) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== undefined) {
        timeout = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    
    if (!timeout) {
      timeout = setTimeout(timerExpired, wait);
    }
  };
}

// SQL Injection prevention for search
export function sanitizeForSQL(input: string): string {
  return input
    .replace(/['";\\]/g, '') // Remove quotes and escape characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comments
    .replace(/\*\//g, '')
    .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi, '') // Remove SQL keywords
    .trim();
}

// Path traversal prevention
export function sanitizePath(path: string): string {
  return path
    .replace(/\.\./g, '') // Remove directory traversal
    .replace(/[<>:"|?*]/g, '') // Remove invalid path characters
    .replace(/\/{2,}/g, '/') // Remove multiple slashes
    .trim();
}