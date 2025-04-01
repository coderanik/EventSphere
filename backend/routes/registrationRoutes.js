import express from 'express';
import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
} from '../controllers/registrationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, registerForEvent);

router.route('/my-registrations')
  .get(protect, getMyRegistrations);

router.route('/:id/cancel')
  .put(protect, cancelRegistration);

router.route('/event/:eventId')
  .get(protect, getEventRegistrations);

export default router;