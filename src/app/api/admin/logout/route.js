import { NextResponse } from 'next/server';

/**
 * Handle POST request for admin logout
 */
export async function POST(request) {
  try {
    // Create a response
    const response = NextResponse.json({
      message: 'Logout successful'
    });
    
    // Remove the auth cookie directly from the response
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    // Return the response
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 