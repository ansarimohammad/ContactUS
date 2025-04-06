import { connect } from '@/lib/db';
import ContactSubmission from '@/models/ContactSubmission';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    // Connect to the database
    await connect();
    
    // Find and update the submission
    const updatedSubmission = await ContactSubmission.findByIdAndUpdate(
      id,
      { $set: { read: true } },
      { new: true }
    );
    
    if (!updatedSubmission) {
      return Response.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    return Response.json({ 
      success: true,
      message: 'Submission marked as read',
      submission: updatedSubmission
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating submission:', error);
    
    return Response.json({ 
      error: 'Failed to update submission', 
      details: error.message 
    }, { status: 500 });
  }
} 