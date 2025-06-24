// src/hooks.server.ts - Enhanced version
import type { Handle } from '@sveltejs/kit';
import { CSP_HEADERS } from '$lib/utils/security';

// Rate limiting store
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (value.resetTime < now) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean up every minute

export const handle: Handle = async ({ event, resolve }) => {
  const startTime = Date.now();
  
  // Extract client IP (consider proxy headers)
  const clientIp = event.request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                   event.request.headers.get('x-real-ip') ||
                   event.getClientAddress();
  
  // Basic rate limiting
  const rateLimitKey = `${clientIp}:${event.url.pathname}`;
  const now = Date.now();
  const rateLimitWindow = 60000; // 1 minute
  const rateLimitMax = 100; // 100 requests per minute per IP per path
  
  let rateLimit = requestCounts.get(rateLimitKey);
  if (!rateLimit || rateLimit.resetTime < now) {
    rateLimit = { count: 1, resetTime: now + rateLimitWindow };
    requestCounts.set(rateLimitKey, rateLimit);
  } else {
    rateLimit.count++;
    if (rateLimit.count > rateLimitMax) {
      return new Response('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetTime - now) / 1000))
        }
      });
    }
  }
  
  // Generate CSRF token for each request
  const csrfToken = generateToken();
  event.locals.csrfToken = csrfToken;
  
  // Add request ID for tracking
  const requestId = crypto.randomUUID();
  
  // Add security headers to the response
  const response = await resolve(event);
  
  // Content Security Policy
  response.headers.set('Content-Security-Policy', CSP_HEADERS['Content-Security-Policy']);
  
  // Additional security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Request-ID', requestId);
  
  // Remove server information
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');
  
  // Set CSRF token in cookie with proper security flags
  response.headers.append('Set-Cookie', 
    `csrf=${csrfToken}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=3600`
  );
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', String(rateLimitMax));
  response.headers.set('X-RateLimit-Remaining', String(rateLimitMax - rateLimit.count));
  response.headers.set('X-RateLimit-Reset', String(rateLimit.resetTime));
  
  // Log suspicious activity
  const responseTime = Date.now() - startTime;
  if (responseTime > 5000 || response.status >= 400) {
    console.log(`[${new Date().toISOString()}] ${event.request.method} ${event.url.pathname} - ${response.status} - ${responseTime}ms - IP: ${clientIp} - ID: ${requestId}`);
  }
  
  // Detect and log potential security threats
  const suspiciousPatterns = [
    /\.\./g, // Directory traversal
    /<script/gi, // XSS attempts
    /union\s+select/gi, // SQL injection
    /javascript:/gi, // XSS protocol
    /on\w+\s*=/gi // Event handlers
  ];
  
  const url = event.url.toString();
  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(url));
  
  if (hasSuspiciousPattern) {
    console.error(`[SECURITY] Suspicious request detected: ${event.request.method} ${url} - IP: ${clientIp} - ID: ${requestId}`);
  }
  
  return response;
};

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
  // Add timestamp for token expiry validation
  const timestamp = Date.now().toString(36);
  return `${token}-${timestamp}`;
}