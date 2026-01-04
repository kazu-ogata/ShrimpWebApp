import express from 'express';
import { signup, login, recoverPassword, verifyResetCode, resetPassword } from '../controllers/auth.controller.js'; // Import new controllers

const router = express.Router();

// Existing routes
router.post('/signup', signup);
router.post('/login', login);

// --- ADD NEW ROUTES ---
router.post('/recover', recoverPassword);
router.post('/verify-code', verifyResetCode); // Route for verification step
router.post('/reset-password', resetPassword);
// --------------------

export default router;
