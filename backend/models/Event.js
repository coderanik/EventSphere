import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
  },
  time: {
    type: String,
    required: [true, 'Please add a time'],
  },
  venue: {
    type: String,
    required: [true, 'Please add a venue'],
  },
  organizer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  capacity: {
    type: Number,
    required: [true, 'Please add capacity'],
  },
  registeredCount: {
    type: Number,
    default: 0,
  }
});

const Event = mongoose.model('Event', eventSchema);

export default Event;