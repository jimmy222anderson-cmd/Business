const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserProfile = require('../models/UserProfile');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { 
  validateSignup, 
  validateSignin, 
  validateForgotPassword, 
  validateResetPassword 
} = require('../middleware/validation');
const { generateVerificationToken, generateResetToken, generateTokenExpiration } = require('../utils/tokenGenerator');
const { sendWelcomeEmail, sendEmailVerification, sendPasswordResetEmail, sendPasswordChangedEmail } = require('../services/email');
const { 
  validatePasswordStrength, 
  hashPassword, 
  comparePassword, 
  isPasswordReused, 
  updatePasswordHistory,
  sanitizePasswordFromLogs
} = require('../utils/passwordSecurity');

/**
 * POST /api/auth/signup
 * Create a new user account
 */
router.post('/signup', authLimiter, validateSignup, async (req, res) => {
  try {
    const { email, password, fullName, companyName } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Email and password are required' 
      });
    }

    // Additional password strength validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Password does not meet security requirements',
        details: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = await UserProfile.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Email already registered' 
      });
    }

    // Hash password using secure utility
    const password_hash = await hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = generateVerificationToken();

    // Create user with password history
    const user = new UserProfile({
      email: email.toLowerCase(),
      password_hash,
      password_history: [password_hash], // Initialize history with first password
      full_name: fullName,
      company: companyName,
      role: 'user',
      email_verified: false,
      email_verification_token: emailVerificationToken
    });

    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.full_name || 'User');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the signup if email fails
    }

    // Send email verification
    try {
      await sendEmailVerification(user.email, user.full_name || 'User', emailVerificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the signup if email fails
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (password_hash excluded by toJSON transform)
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        full_name: user.full_name,
        company: user.company,
        role: user.role,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Signup error:', sanitizePasswordFromLogs(error));
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create account' 
    });
  }
});

/**
 * POST /api/auth/signin
 * Sign in with email and password
 */
router.post('/signin', authLimiter, validateSignin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await UserProfile.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid email or password' 
      });
    }

    // Verify password using secure utility
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid email or password' 
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({ 
        error: 'Email not verified',
        message: 'Please verify your email address before signing in. Check your inbox for the verification link.' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (password_hash excluded by toJSON transform)
    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        full_name: user.full_name,
        company: user.company,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Signin error:', sanitizePasswordFromLogs(error));
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to sign in' 
    });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    // User is already attached to req by requireAuth middleware
    res.json({
      user: {
        _id: req.user._id,
        email: req.user.email,
        full_name: req.user.full_name,
        company: req.user.company,
        role: req.user.role,
        created_at: req.user.created_at,
        updated_at: req.user.updated_at
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to get user information' 
    });
  }
});

/**
 * POST /api/auth/signout
 * Sign out (client-side token removal)
 * This endpoint exists for consistency but the actual sign out happens client-side
 */
router.post('/signout', (req, res) => {
  res.json({ 
    message: 'Signed out successfully' 
  });
});

/**
 * GET /api/auth/verify-email/:token
 * Verify user email address
 */
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find user by verification token
    const user = await UserProfile.findOne({ 
      email_verification_token: token 
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Verification failed',
        message: 'Invalid or expired verification token' 
      });
    }

    // Check if already verified
    if (user.email_verified) {
      return res.status(200).json({ 
        message: 'Email already verified',
        user: {
          _id: user._id,
          email: user.email,
          email_verified: user.email_verified
        }
      });
    }

    // Update user verification status
    user.email_verified = true;
    user.email_verification_token = null;
    await user.save();

    res.json({ 
      message: 'Email verified successfully',
      user: {
        _id: user._id,
        email: user.email,
        email_verified: user.email_verified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to verify email' 
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', authLimiter, validateForgotPassword, async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Email is required' 
      });
    }

    // Find user by email
    const user = await UserProfile.findOne({ email: email.toLowerCase() });

    // Always return success message (don't reveal if email exists)
    // This is a security best practice to prevent email enumeration
    if (!user) {
      return res.json({ 
        message: 'If an account exists with this email, you will receive a password reset link shortly.' 
      });
    }

    // Generate password reset token
    const resetToken = generateResetToken();
    const resetExpires = generateTokenExpiration(1); // 1 hour expiration

    // Save token and expiration to user document
    user.password_reset_token = resetToken;
    user.password_reset_expires = resetExpires;
    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    // Return success message (don't reveal if email exists)
    res.json({ 
      message: 'If an account exists with this email, you will receive a password reset link shortly.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process password reset request' 
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', authLimiter, validateResetPassword, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Token and new password are required' 
      });
    }

    // Additional password strength validation
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Password does not meet security requirements',
        details: passwordValidation.errors
      });
    }

    // Find user by reset token
    const user = await UserProfile.findOne({ 
      password_reset_token: token 
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Reset failed',
        message: 'Invalid or expired reset token' 
      });
    }

    // Check token expiration
    if (user.password_reset_expires < new Date()) {
      return res.status(400).json({ 
        error: 'Reset failed',
        message: 'Reset token has expired. Please request a new password reset.' 
      });
    }

    // Check if password was used recently
    const isReused = await isPasswordReused(newPassword, user.password_history || []);
    if (isReused) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'You cannot reuse a recent password. Please choose a different password.' 
      });
    }

    // Hash new password using secure utility
    const password_hash = await hashPassword(newPassword);

    // Update password history
    const updatedHistory = updatePasswordHistory(password_hash, user.password_history || []);

    // Update user password
    user.password_hash = password_hash;
    user.password_history = updatedHistory;
    user.password_reset_token = null;
    user.password_reset_expires = null;
    await user.save();

    // Send password changed confirmation email
    try {
      await sendPasswordChangedEmail(user.email, user.full_name || 'User');
    } catch (emailError) {
      console.error('Failed to send password changed email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ 
      message: 'Password has been reset successfully. You can now sign in with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', sanitizePasswordFromLogs(error));
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to reset password' 
    });
  }
});

module.exports = router;
