import { connect } from '@/lib/db';
import ContactSubmission from '@/models/ContactSubmission';

export async function GET(request) {
  try {
    // Connect to the database
    await connect();
    
    // Get current date
    const now = new Date();
    
    // Calculate start of today, week, and month
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get total count
    const total = await ContactSubmission.countDocuments();
    
    // Get today's count
    const today = await ContactSubmission.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    
    // Get this week's count
    const week = await ContactSubmission.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    
    // Get this month's count
    const month = await ContactSubmission.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Get unread count
    const unread = await ContactSubmission.countDocuments({
      read: false
    });
    
    // Return the stats
    return Response.json({
      total,
      today,
      week,
      month,
      unread
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    
    return Response.json({ 
      error: 'Failed to fetch statistics', 
      details: error.message 
    }, { status: 500 });
  }
} 