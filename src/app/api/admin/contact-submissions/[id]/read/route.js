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

// PUT - mark a submission as read
export async function PUT(request, { params }) {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth(request);
    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    // Connect to the database
    await connect();
    
    // Find and update the submission
    const submission = await ContactSubmission.findByIdAndUpdate(
      id,
      { $set: { read: true } },
      { new: true }
    );
    
    if (!submission) {
      return Response.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    // Return the updated submission
    return Response.json({ 
      message: 'Submission marked as read',
      submission 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error marking submission as read:', error);
    
    return Response.json({ 
      error: 'Failed to mark submission as read', 
      details: error.message 
    }, { status: 500 });
  }
} 