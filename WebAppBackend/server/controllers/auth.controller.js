import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { sendPasswordResetEmail } from '../config/mail.config.js';
import QrSession from '../models/qrSession.model.js';

// --- Signup Function ---
export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email and password are required' });
  }
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await User.create({ username, email, password: hashedPassword });
    const token = jwt.sign({ username: result.username, id: result._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    // Send back user info (excluding password) and token
    res.status(201).json({ result: { id: result._id, username: result.username, email: result.email }, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Something went wrong during signup.', error: error.message });
  }
};

// --- Login Function ---
export const login = async (req, res) => {
  const { loginInput, password } = req.body; // Accepts username or email
  if (!loginInput || !password) {
    return res.status(400).json({ message: 'Identifier (username/email) and password are required' });
  }
  try {
    const existingUser = await User.findOne({ $or: [ { username: loginInput }, { email: loginInput } ] });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: existingUser.username, id: existingUser._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    // Send back user info (excluding password) and token
    res.status(200).json({ success: true, message: 'Login Successful', result: { id: existingUser._id, username: existingUser.username, email: existingUser.email }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong during login.', error: error.message });
  }
};

// --- Recover Password Function ---
export const recoverPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Password reset attempt for non-existent email:', email);
      // Don't reveal user existence
      return res.status(200).json({ message: 'If an account with that email exists, a password reset code has been sent.' });
    }

    // Generate a simple 6-digit code
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 3600000); // 1 hour expiration

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expiryDate;
    await user.save();

    // Send the email
    const emailSent = await sendPasswordResetEmail(user.email, resetToken);

    if (emailSent) {
      res.status(200).json({ message: 'Password reset code sent to email.' });
    } else {
      // If email fails, clear the token to allow retry
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      res.status(500).json({ message: 'Error sending password reset email.' });
    }

  } catch (error) {
    console.error('Recover password error:', error);
    res.status(500).json({ message: 'Something went wrong during password recovery.' });
  }
};

// --- Verify Reset Code Function ---
export const verifyResetCode = async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(400).json({ message: 'Email and code are required' });
    }

    try {
        const user = await User.findOne({
            email,
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() } // Check expiry
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset code is invalid or has expired.' });
        }

        // Send success if code is valid
        res.status(200).json({ message: 'Code verified successfully.' });

    } catch (error) {
        console.error('Verify reset code error:', error);
        res.status(500).json({ message: 'Something went wrong during code verification.' });
    }
};

// --- Reset Password Function ---
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, code, and new password are required' });
  }

  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() } // Check expiry
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset code is invalid or has expired.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send success message
    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Something went wrong during password reset.' });
  }
};

export const authorizeMachine = async (req, res) => {
  const { sessionId, userId } = req.body;

  try {
    // Look for the "pending" session the Pi just created
    const session = await QrSession.findOneAndUpdate(
      { sessionId, status: 'pending' },
      { userId, status: 'completed' },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'QR Code is expired or invalid.' });
    }

    res.status(200).json({ success: true, message: 'Machine authorized!' });
  } catch (error) {
    res.status(500).json({ message: 'Authorization failed', error: error.message });
  }
};