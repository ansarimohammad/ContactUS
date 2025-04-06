import mongoose from 'mongoose';

// Check if the model is already defined
const ContactSubmission = mongoose.models.ContactSubmission || mongoose.model('ContactSubmission', new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // Additional metadata fields
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'pending', 'responded', 'closed'],
      default: 'new'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { 
    timestamps: true, 
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
      virtuals: true
    }
  }
));

export default ContactSubmission; 