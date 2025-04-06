import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Secret key for JWT signing/verification
// In production, use a proper environment variable
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Token expiration time (24 hours)
const EXPIRATION_TIME = '24h';

// Cookie configuration
const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day in seconds

// Admin credentials
// In a real application, these would be stored in a database
// and the password would be hashed
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123',
};

/**
 * Authenticate admin user
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {boolean} - Authentication result
 */
export function authenticateAdmin(username, password) {
  // Log the authentication attempt and expected values
  console.log('Auth attempt with:', { 
    username, 
    password: '***',
    expectedUsername: ADMIN_CREDENTIALS.username,
    hasPassword: !!ADMIN_CREDENTIALS.password
  });
  
  // Perform the actual authentication
  const isUsernameMatch = username === ADMIN_CREDENTIALS.username;
  const isPasswordMatch = password === ADMIN_CREDENTIALS.password;
  
  console.log('Auth matches:', { 
    usernameMatch: isUsernameMatch, 
    passwordMatch: isPasswordMatch 
  });
  
  // In a real application, you would query a database
  // and compare hashed passwords
  return isUsernameMatch && isPasswordMatch;
}

/**
 * Generate a JWT token for authenticated admin
 * @param {string} username - Admin username
 * @returns {string} - JWT token
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
 * @param {string} token - JWT token
 * @returns {boolean} - Verification result
 */
export async function verifyToken(token) {
  try {
    console.log('Verifying token...');
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(SECRET_KEY);
    
    const { payload } = await jwtVerify(token, secretKey);
    console.log('Token verified successfully:', payload);
    return !!payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

/**
 * Set authentication cookie
 * @param {string} token - JWT token
 * @returns {void}
 */
export function setAuthCookie(token) {
  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}

/**
 * Get authentication cookie
 * @param {Request} request - HTTP request
 * @returns {string|null} - Cookie value or null
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
 * Remove authentication cookie
 * @returns {void}
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
 * Get the token from cookies
 * @returns {string|null} - The token from cookies or null
 */
export function getTokenFromCookies() {
  const cookieStore = cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

/**
 * Middleware to check if admin is authenticated
 * @returns {Promise<boolean>} - Whether the admin is authenticated
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