import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    // Get the token directly from request cookies
    const token = request.cookies.get('auth_token')?.value;
    console.log('Auth check - token found:', !!token);
    
    if (!token) {
      console.log('Auth check - no token found');
      return NextResponse.json({ 
        authenticated: false,
        message: 'No authentication token found'
      }, { status: 401 });
    }
    
    // Verify the token
    console.log('Auth check - verifying token...');
    const isValid = await verifyToken(token);
    console.log('Auth check - token valid:', isValid);
    
    if (!isValid) {
      console.log('Auth check - invalid token');
      return NextResponse.json({ 
        authenticated: false,
        message: 'Invalid authentication token'
      }, { status: 401 });
    }
    
    // If token is valid, return authenticated: true
    console.log('Auth check - authentication successful');
    return NextResponse.json({ 
      authenticated: true,
      message: 'Authentication successful'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Authentication check error:', error);
    
    return NextResponse.json({ 
      authenticated: false,
      message: 'Authentication error',
      error: error.message
    }, { status: 500 });
  }
} 