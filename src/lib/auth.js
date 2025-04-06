import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Secret key for JWT signing/verification
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Token expiration time (24 hours)
const EXPIRATION_TIME = '24h';

// Cookie configuration
const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day in seconds

// Admin credentials - use hashed password from environment
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  // No default password - stored as hash in environment variable
  passwordHash: process.env.ADMIN_PASSWORD_HASH,
};

/**
 * Hash a password using SHA-256
 * @param {string} password - The plain text password to hash
 * @returns {string} The hashed password
 */
export function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}

/**
 * Verify a password against a stored hash
 * @param {string} password - The plain text password to verify
 * @param {string} hash - The stored password hash
 * @returns {boolean} True if the password matches the hash
 */
export function verifyPassword(password, hash) {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}

/**
 * Authenticate admin user
 */
export function authenticateAdmin(username, password) {
  // Check if username matches
  if (username !== ADMIN_CREDENTIALS.username) {
    return false;
  }
  
  // If no password hash is set, authentication fails
  if (!ADMIN_CREDENTIALS.passwordHash) {
    console.error('No admin password hash configured in environment variables');
    return false;
  }
  
  // Verify the password against the stored hash
  return verifyPassword(password, ADMIN_CREDENTIALS.passwordHash);
}

/**
 * Generate a JWT token for authenticated admin
 */
export async function generateToken(username) {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(SECRET_KEY);
  
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRATION_TIME)
    .sign(secretKey);
  
  return token;
}

/**
 * Verify JWT token
 */
export async function verifyToken(token) {
  try {
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(SECRET_KEY);
    
    const { payload } = await jwtVerify(token, secretKey);
    return !!payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

/**
 * Get authentication cookie from request
 */
export function getAuthCookie(request) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {});
  
  return cookies[COOKIE_NAME] || null;
}

/**
 * Get the token from cookies
 */
export function getTokenFromCookies() {
  const cookieStore = cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

/**
 * Remove authentication cookie
 */
export function removeAuthCookie() {
  cookies().set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}

/**
 * Middleware to check if admin is authenticated
 */
export async function isAuthenticated() {
  const token = getTokenFromCookies();
  if (!token) return false;
  
  const isValid = await verifyToken(token);
  return !!isValid;
}

/**
 * Server-side middleware for protected API routes
 */
export async function protectApiRoute(req) {
  const token = getTokenFromCookies();
  
  if (!token) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const isValid = await verifyToken(token);
  if (!isValid) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return null; // No error, proceed with the request
} 