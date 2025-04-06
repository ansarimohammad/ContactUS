import { connect } from '@/lib/db';
import ContactSubmission from '@/models/ContactSubmission';

export async function GET(request, { params }) {
  try {
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