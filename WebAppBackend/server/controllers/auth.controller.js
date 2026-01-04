import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { sendPasswordResetEmail } from '../config/mail.config.js';

// --- Signup Function (Unchanged) ---
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
    res.status(201).json({ result: { id: result._id, username: result.username, email: result.email }, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Something went wrong during signup.', error: error.message });
  }
};

// --- Login Function (Unchanged) ---
export const login = async (req, res) => {
  const { loginInput, password } = req.body;
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
    res.status(200).json({ success: true, message: 'Login Successful', result: { id: existingUser._id, username: existingUser.username, email: existingUser.email }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong during login.', error: error.message });
  }
};

// --- Recover Password Function (Header Check REMOVED) ---
export const recoverPassword = async (req, res) => {
  /*
  // --- HEADER CHECK REMOVED ---
  const clientType = req.headers['x-client-type'];
  if (clientType !== 'mobile') {
     console.warn(`[recoverPassword] Blocked request from non-mobile client: ${clientType || 'Not Provided'}`);
     return res.status(403).json({ message: 'Password recovery is only available from the mobile app.' });
  }
  // ------------------------
  */

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Password reset attempt for non-existent email:', email);
      return res.status(200).json({ message: 'If an account with that email exists, a password reset code has been sent.' });
    }
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 3600000); // 1 hour
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expiryDate;
    await user.save();
    const emailSent = await sendPasswordResetEmail(user.email, resetToken);
    if (emailSent) {
      res.status(200).json({ message: 'Password reset code sent to email.' });
    } else {
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

// --- Verify Reset Code Function (Header Check REMOVED) ---
export const verifyResetCode = async (req, res) => {
    /*
    // --- HEADER CHECK REMOVED ---
    const clientType = req.headers['x-client-type'];
    if (clientType !== 'mobile') {
        console.warn(`[verifyResetCode] Blocked request from non-mobile client: ${clientType || 'Not Provided'}`);
        return res.status(403).json({ message: 'Password recovery is only available from the mobile app.' });
    }
    // ------------------------
    */

    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(400).json({ message: 'Email and code are required' });
    }
    try {
        const user = await User.findOne({
            email,
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Password reset code is invalid or has expired.' });
        }
        res.status(200).json({ message: 'Code verified successfully.' });
    } catch (error) {
        console.error('Verify reset code error:', error);
        res.status(500).json({ message: 'Something went wrong during code verification.' });
    }
};

// --- Reset Password Function (Header Check REMOVED) ---
export const resetPassword = async (req, res) => {
  /*
  // --- HEADER CHECK REMOVED ---
  const clientType = req.headers['x-client-type'];
  if (clientType !== 'mobile') {
     console.warn(`[resetPassword] Blocked request from non-mobile client: ${clientType || 'Not Provided'}`);
     return res.status(403).json({ message: 'Password recovery is only available from the mobile app.' });
  }
  // ------------------------
  */

  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, code, and new password are required' });
  }
  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Password reset code is invalid or has expired.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Something went wrong during password reset.' });
  }
};
