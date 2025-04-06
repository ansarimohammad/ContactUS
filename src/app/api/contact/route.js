import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import ContactSubmission from '../../../models/ContactSubmission';
import { connect } from '@/lib/db';

// Main handler function for contact form submissions
export async function POST(request) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return Response.json(
        { error: 'Name, email, and message are required fields' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connect();
    
    // Create submission with metadata
    const submission = new ContactSubmission({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      message: data.message,
      read: false, // All new submissions are unread
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    // Save the submission
    await submission.save();
    
    // Return success response
    return Response.json(
      { 
        success: true, 
        message: 'Contact form submitted successfully',
        submission: submission
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error submitting contact form:', error);
    
    return Response.json(
      { 
        error: 'Failed to submit contact form', 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 