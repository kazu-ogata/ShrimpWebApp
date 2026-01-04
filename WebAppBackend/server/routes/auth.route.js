import express from 'express';
<<<<<<< HEAD
import { signup, login, recoverPassword, verifyResetCode, resetPassword, authorizeMachine } from '../controllers/auth.controller.js';
=======
import { signup, login, recoverPassword, verifyResetCode, resetPassword } from '../controllers/auth.controller.js'; // Import new controllers
>>>>>>> 4d650426e7e7c2dadd09ac53b2578d602f8a8c9a

const router = express.Router();

// Existing routes
router.post('/signup', signup);
router.post('/login', login);
<<<<<<< HEAD
=======

// --- ADD NEW ROUTES ---
router.post('/recover', recoverPassword);
router.post('/verify-code', verifyResetCode); // Route for verification step
router.post('/reset-password', resetPassword);
// --------------------
>>>>>>> 4d650426e7e7c2dadd09ac53b2578d602f8a8c9a

// --- ADD NEW ROUTES ---
router.post('/recover', recoverPassword);
router.post('/verify-code', verifyResetCode); // Route for verification step
router.post('/reset-password', resetPassword);
// --------------------

router.post('/authorize-machine', authorizeMachine);

export default router;