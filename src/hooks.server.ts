// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { CSP_HEADERS } from '$lib/utils/security';

export const handle: Handle = async ({ event, resolve }) => {
  // Generate CSRF token for each request
  const csrfToken = generateToken();
  event.locals.csrfToken = csrfToken;
  
  // Add security headers to the response
  const response = await resolve(event);
  
  // Content Security Policy
  response.headers.set('Content-Security-Policy', CSP_HEADERS['Content-Security-Policy']);
  
  // Additional security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Set CSRF token in cookie
  response.headers.append('Set-Cookie', 
    `csrf=${csrfToken}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=3600`
  );
  
  return response;
};

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}