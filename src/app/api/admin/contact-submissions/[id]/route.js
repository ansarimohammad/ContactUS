import { connect } from '@/lib/db';
import ContactSubmission from '@/models/ContactSubmission';
import { getAuthCookie, verifyToken } from '@/lib/auth';

// Helper function to check authentication
async function checkAuth(request) {
  const token = getAuthCookie(request);
  if (!token) {
    return false;
  }
  
  return await verifyToken(token);
}

// GET - fetch a single submission
export async function GET(request, { params }) {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth(request);
    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    // Connect to the database
    await connect();
    
    // Find the submission
    const submission = await ContactSubmission.findById(id);
    
    if (!submission) {
      return Response.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    // Return the submission
    return Response.json({ submission }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching submission:', error);
    
    return Response.json({ 
      error: 'Failed to fetch submission', 
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - update a submission
export async function PUT(request, { params }) {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth(request);
    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    const data = await request.json();
    
    // Connect to the database
    await connect();
    
    // Find and update the submission
    const submission = await ContactSubmission.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!submission) {
      return Response.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    // Return the updated submission
    return Response.json({ 
      message: 'Submission updated successfully',
      submission 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating submission:', error);
    
    return Response.json({ 
      error: 'Failed to update submission', 
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE - delete a submission
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth(request);
    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    // Connect to the database
    await connect();
    
    // Find and delete the submission
    const submission = await ContactSubmission.findByIdAndDelete(id);
    
    if (!submission) {
      return Response.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    // Return success message
    return Response.json({ 
      message: 'Submission deleted successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error deleting submission:', error);
    
    return Response.json({ 
      error: 'Failed to delete submission', 
      details: error.message 
    }, { status: 500 });
  }
} 