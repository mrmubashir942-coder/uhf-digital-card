import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractCloudinaryPublicId,
} from '../cloudinary.ts';
import { syncCompanySettingsToFirestore, syncEmployeeToFirestore } from '../firestore.ts';

export const uploadRouter = Router();

// 5MB maximum file size
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

interface UploadRequestBody {
  image: string; // Base64 data URI: data:image/png;base64,...
  employeeId?: string;
  fileName?: string;
}

/**
 * Validates base64 data URI format, allowed MIME types, and maximum 5MB size
 */
function validateImageData(dataUri: string): { mimeType: string; sizeBytes: number } {
  if (!dataUri || typeof dataUri !== 'string') {
    throw new Error('Image data is missing. Please provide a valid image.');
  }

  const matches = dataUri.match(/^data:([a-zA-Z0-9+/.-]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid image format. Expected a base64 encoded data URI.');
  }

  const mimeType = matches[1].toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error('Unsupported image format. Allowed formats: JPEG, PNG, WebP, GIF, and SVG.');
  }

  const base64Data = matches[2];
  // Calculate approximate decoded byte size
  const sizeBytes = Math.round((base64Data.length * 3) / 4);

  if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image file is too large. Maximum allowed size is 5MB.');
  }

  return { mimeType, sizeBytes };
}

// POST /api/upload/company-logo (Admin only)
uploadRouter.post(
  '/company-logo',
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { image, fileName } = req.body as UploadRequestBody;
      validateImageData(image);

      // Check existing company settings for previous logo to delete if it was on Cloudinary
      const currentCompany = await db.getCompanySettings();
      const prevLogoUrl = currentCompany.logoUrl;
      const prevPublicId = extractCloudinaryPublicId(prevLogoUrl);

      // Upload to Cloudinary under folder UHF-Solutions/company
      const ext = fileName?.split('.').pop() || 'png';
      const cleanFileName = `logo_${Date.now()}`;
      
      const uploadResult = await uploadToCloudinary({
        dataUri: image,
        folder: 'UHF-Solutions/company',
        publicId: cleanFileName,
      });

      // Update local database
      const updatedSettings = await db.updateCompanySettings({
        logoUrl: uploadResult.secureUrl,
      });

      // Update Firestore document company/settings
      await syncCompanySettingsToFirestore({
        companyName: updatedSettings.companyName,
        logoUrl: uploadResult.secureUrl,
        website: updatedSettings.website,
        email: updatedSettings.email,
        phone: updatedSettings.phone,
        officeAddress: updatedSettings.officeAddress,
        primaryColor: updatedSettings.primaryColor,
        accentColor: updatedSettings.accentColor,
      });

      // Delete previous Cloudinary image if it exists and changed
      if (prevPublicId && prevPublicId !== uploadResult.publicId) {
        await deleteFromCloudinary(prevPublicId);
      }

      await db.logActivity({
        actorId: req.user?.id,
        actorName: req.user?.employeeId || 'Administrator',
        actorRole: 'ADMIN',
        action: 'COMPANY_LOGO_UPLOAD',
        category: 'ADMIN',
        details: 'Uploaded and updated corporate company logo',
      });

      res.json({
        message: 'Company logo uploaded and updated successfully.',
        url: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
        company: updatedSettings,
      });
    } catch (err: any) {
      console.error('Company logo upload error:', err);
      res.status(400).json({ error: err.message || 'Failed to upload company logo.' });
    }
  }
);

// POST /api/upload/employee-photo (Admin or Employee for their own photo)
uploadRouter.post(
  '/employee-photo',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { image, employeeId: requestedEmpId, fileName } = req.body as UploadRequestBody;
      validateImageData(image);

      const currentUser = req.user!;
      let targetEmployeeId = '';

      if (currentUser.role === 'ADMIN') {
        // Admin can upload for any employee specified, or themselves
        targetEmployeeId = (requestedEmpId || currentUser.employeeId).trim();
      } else {
        // Non-admin employee can ONLY upload for themselves
        if (requestedEmpId && requestedEmpId.trim().toUpperCase() !== currentUser.employeeId.toUpperCase()) {
          res.status(403).json({
            error: 'Forbidden: You are only authorized to upload your own profile photo.',
          });
          return;
        }
        targetEmployeeId = currentUser.employeeId;
      }

      // Verify employee exists (if already registered)
      const employee = await db.getFullEmployeeByEmployeeId(targetEmployeeId);
      if (!employee && currentUser.role !== 'ADMIN') {
        res.status(404).json({ error: `Employee record ${targetEmployeeId} not found.` });
        return;
      }

      // Check existing photo to delete from Cloudinary if replacing
      const prevPhotoUrl = employee?.profile?.profilePhoto;
      const prevPublicId = extractCloudinaryPublicId(prevPhotoUrl);

      // Clean employee ID for folder path
      const safeEmpId = targetEmployeeId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanPhotoId = `photo_${Date.now()}`;

      // Upload to Cloudinary under folder UHF-Solutions/profile-photos/{employeeId}
      const uploadResult = await uploadToCloudinary({
        dataUri: image,
        folder: `UHF-Solutions/profile-photos/${safeEmpId}`,
        publicId: cleanPhotoId,
      });

      // Update database profile if employee exists
      if (employee) {
        if (currentUser.role === 'ADMIN' && employee.id !== currentUser.id) {
          await db.updateEmployee(employee.id, {
            profilePhoto: uploadResult.secureUrl,
          });
        } else {
          await db.updateEmployeeSelfProfile(employee.id, {
            profilePhoto: uploadResult.secureUrl,
          });
        }

        // Update Firestore document employees/{employeeId}
        await syncEmployeeToFirestore(targetEmployeeId, {
          employeeId: targetEmployeeId,
          fullName: employee.profile.fullName,
          designation: employee.profile.designation,
          department: employee.profile.department,
          profilePhoto: uploadResult.secureUrl,
          status: employee.status,
          role: employee.role,
        });

        // Delete previous Cloudinary image if it exists and changed
        if (prevPublicId && prevPublicId !== uploadResult.publicId) {
          await deleteFromCloudinary(prevPublicId);
        }
      }

      await db.logActivity({
        actorId: currentUser.id,
        actorName: currentUser.employeeId,
        actorRole: currentUser.role,
        action: 'PHOTO_UPLOAD',
        category: 'PROFILE',
        targetId: targetEmployeeId,
        targetName: employee?.profile.fullName || targetEmployeeId,
        details: `${currentUser.role === 'ADMIN' ? 'Administrator' : 'Employee'} uploaded new profile photo for ${targetEmployeeId}`,
      });

      res.json({
        message: 'Profile photo uploaded and updated successfully.',
        url: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
        employeeId: targetEmployeeId,
      });
    } catch (err: any) {
      console.error('Employee photo upload error:', err);
      res.status(400).json({ error: err.message || 'Failed to upload profile photo.' });
    }
  }
);
