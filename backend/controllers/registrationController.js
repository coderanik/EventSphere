import Registration from '../models/Registration.js';
import Event from '../models/Event.js';

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${eventId}`,
      });
    }

    // Check if event has reached capacity
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event has reached its capacity',
      });
    }

    // Check if user is already registered for the event
    const existingRegistration = await Registration.findOne({
      event: eventId,
      user: req.user.id,
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event',
      });
    }

    // Create registration
    const registration = await Registration.create({
      event: eventId,
      user: req.user.id,
    });

    // Increment registeredCount in the event
    await Event.findByIdAndUpdate(eventId, {
      $inc: { registeredCount: 1 },
    });

    res.status(201).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel registration
// @route   PUT /api/registrations/:id/cancel
// @access  Private
export const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: `Registration not found with id of ${req.params.id}`,
      });
    }

    // Make sure user owns this registration
    if (registration.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this registration',
      });
    }

    // Update registration status
    registration.status = 'cancelled';
    await registration.save();

    // Decrement registeredCount in the event
    await Event.findByIdAndUpdate(registration.event, {
      $inc: { registeredCount: -1 },
    });

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get registrations for logged in user
// @route   GET /api/registrations/my-registrations
// @access  Private
export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
      .populate({
        path: 'event',
        select: 'title date time venue',
      })
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all registrations for an event
// @route   GET /api/registrations/event/:eventId
// @access  Private (Admin or Event Organizer only)
export const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.eventId}`,
      });
    }

    // Check if user is admin or event organizer
    if (
      req.user.role !== 'admin' &&
      event.organizer.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this information',
      });
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate({
        path: 'user',
        select: 'name email',
      })
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};