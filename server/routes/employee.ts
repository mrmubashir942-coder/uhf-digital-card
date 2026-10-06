import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.ts';

export const employeeRouter = Router();

// Ensure all employee routes require active authentication
employeeRouter.use(requireAuth);

// GET /api/employee/profile
employeeRouter.get('/profile', async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const profile = await db.getProfileByUserId(user.id);
    const company = await db.getCompanySettings();

    if (!profile) {
      res.status(404).json({ error: 'Profile not found.' });
      return;
    }

    const { passwordHash: _, ...safeUser } = user;

    res.json({
      user: safeUser,
      profile,
      company,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// PUT /api/employee/profile
employeeRouter.put('/profile', async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { phone, whatsapp, linkedin, twitter, github, website, bio, profilePhoto, nfcEnabled } = req.body;

    // Reject raw oversized base64 payloads to preserve database performance
    if (typeof profilePhoto === 'string' && profilePhoto.startsWith('data:') && profilePhoto.length > 3 * 1024 * 1024) {
      res.status(400).json({ error: 'Image is too large. Please upload images under 2MB.' });
      return;
    }

    const updatedProfile = await db.updateEmployeeSelfProfile(user.id, {
      phone,
      whatsapp,
      linkedin,
      twitter,
      github,
      website,
      bio,
      profilePhoto,
      nfcEnabled,
    });

    await db.logActivity({
      actorId: user.id,
      actorName: updatedProfile.fullName || user.employeeId,
      actorRole: user.role,
      action: 'PROFILE_UPDATE',
      category: 'PROFILE',
      targetId: user.id,
      targetName: `${updatedProfile.fullName} (${user.employeeId})`,
      details: 'Employee updated personal contact and business card information',
    });

    res.json({
      message: 'Profile updated successfully.',
      profile: updatedProfile,
    });
  } catch (err: any) {
    console.error('Error updating self profile:', err);
    res.status(500).json({ error: err.message || 'Failed to update profile.' });
  }
});

// POST /api/employee/change-password
employeeRouter.post('/change-password', async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Incorrect current password.' });
      return;
    }

    await db.updatePassword(user.id, newPassword);

    await db.logActivity({
      actorId: user.id,
      actorName: user.employeeId,
      actorRole: user.role,
      action: 'PASSWORD_CHANGE',
      category: 'PROFILE',
      targetId: user.id,
      details: 'Employee updated account password',
    });

    res.json({ message: 'Password updated successfully. Please use your new password next time.' });
  } catch (err: any) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Failed to update password.' });
  }
});
