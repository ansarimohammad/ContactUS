import { NextResponse } from 'next/server';
import { authenticateAdmin, generateToken } from '../../../../lib/auth';

/**
 * Handle POST request for admin login
 */
export async function POST(request) {
  try {
    // Parse request body
    const { username, password } = await request.json();
    
    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Authenticate admin
    const isAuthenticated = authenticateAdmin(username, password);
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = await generateToken(username);
    
    // Create a response with the auth cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: { username, role: 'admin' }
    });
    
    // Set auth cookie directly on the response
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day in seconds
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    // Return the response
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 