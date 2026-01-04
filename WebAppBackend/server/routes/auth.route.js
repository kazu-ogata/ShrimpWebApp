import express from 'express';
import { signup, login, recoverPassword, verifyResetCode, resetPassword, authorizeMachine } from '../controllers/auth.controller.js';

const router = express.Router();

// Existing routes
router.post('/signup', signup);
router.post('/login', login);

// --- ADD NEW ROUTES ---
router.post('/recover', recoverPassword);
router.post('/verify-code', verifyResetCode); // Route for verification step
router.post('/reset-password', resetPassword);
// --------------------

router.post('/authorize-machine', authorizeMachine);

export default router;