import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import ContactSubmission from '../../../../models/ContactSubmission';
import { getAuthCookie, verifyToken } from '@/lib/auth';

// Simple mock authentication middleware
// In a real app, you would use proper authentication
async function checkAuth(request) {
  // This is a very basic implementation
  // In a real app, you would validate a session token or similar
  return true; // For demo purposes, we're allowing all requests
}

export async function GET(request) {
  try {
    // Check authentication
    const token = getAuthCookie(request);
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const isValid = await verifyToken(token);
    if (!isValid) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get URL params
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || 'all';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    
    // Connect to the database
    await connect();
    
    // Build query
    const query = {};
    
    // Add status filter
    if (status === 'read') {
      query.read = true;
    } else if (status === 'unread') {
      query.read = false;
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Count total matching documents
    const total = await ContactSubmission.countDocuments(query);
    
    // Calculate total pages
    const totalPages = Math.ceil(total / perPage);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Query for submissions with pagination
    const submissions = await ContactSubmission.find(query)
      .sort(sort)
      .skip((page - 1) * perPage)
      .limit(perPage);
    
    // Return data
    return Response.json({
      submissions,
      page,
      perPage,
      total,
      totalPages,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching submissions:', error);
    
    return Response.json({ 
      error: 'Failed to fetch submissions', 
      details: error.message 
    }, { status: 500 });
  }
}

// Retrieve a specific submission by ID
export async function POST(request) {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get submission ID from request
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { message: 'Submission ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connect();
    
    // Find the submission by ID
    const submission = await ContactSubmission.findById(id).lean();
    if (!submission) {
      return NextResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Error fetching submission by ID:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a submission status
export async function PUT(request) {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get submission data from request
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json(
        { message: 'Submission ID and status are required' },
        { status: 400 }
      );
    }
    
    // Validate status
    const validStatuses = ['new', 'pending', 'responded', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connect();
    
    // Update the submission status
    const updatedSubmission = await ContactSubmission.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).lean();
    
    if (!updatedSubmission) {
      return NextResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Status updated successfully',
      submission: updatedSubmission
    });
  } catch (error) {
    console.error('Error updating submission status:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 