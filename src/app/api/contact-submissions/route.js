import { connect } from '@/lib/db';
import ContactSubmission from '@/models/ContactSubmission';

export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    
    // Connect to the database
    await connect();
    
    // Build query
    const query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (status === 'read') {
      query.read = true;
    } else if (status === 'unread') {
      query.read = false;
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * perPage;
    
    // Define sort object
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    
    // Get total count
    const total = await ContactSubmission.countDocuments(query);
    
    // Get submissions with pagination and sorting
    const submissions = await ContactSubmission
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(perPage);
    
    // Calculate total pages
    const totalPages = Math.ceil(total / perPage);
    
    // Return submissions data
    return Response.json({
      submissions,
      total,
      page,
      perPage,
      totalPages
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    
    return Response.json({ 
      error: 'Failed to fetch contact submissions', 
      details: error.message 
    }, { status: 500 });
  }
} 