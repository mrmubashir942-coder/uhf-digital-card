import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase.ts';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
  url: string;
  storagePath: string;
}

/**
 * Validates image type and size.
 */
export function validateImageFile(file: File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file format. Please upload a JPEG, PNG, WebP, or SVG image.');
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image file is too large. Maximum allowed size is 5MB.');
  }
}

/**
 * Uploads an employee profile photo to Firebase Storage.
 * Saves under: profile-photos/[employeeId]_[timestamp].[ext]
 * Returns public download URL.
 */
export async function uploadProfilePhoto(
  file: File,
  employeeId: string
): Promise<UploadResult> {
  validateImageFile(file);

  const cleanEmployeeId = (employeeId || 'employee').replace(/[^a-zA-Z0-9_-]/g, '_');
  const extension = file.name.split('.').pop() || 'jpg';
  const fileName = `photo_${Date.now()}.${extension}`;
  const storagePath = `profile-photos/${cleanEmployeeId}/${fileName}`;

  try {
    const storageRef = ref(storage, storagePath);
    const metadata = {
      contentType: file.type,
      customMetadata: {
        employeeId: cleanEmployeeId,
        uploadedAt: new Date().toISOString(),
      },
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const url = await getDownloadURL(snapshot.ref);

    return { url, storagePath };
  } catch (err: any) {
    console.error('Firebase Storage upload error:', err);
    throw new Error(
      err.message || 'Failed to upload photo to Firebase Storage. Please check storage bucket configuration.'
    );
  }
}

/**
 * Uploads company corporate logo to Firebase Storage.
 * Saves under: company/logo_[timestamp].[ext]
 */
export async function uploadCompanyLogo(file: File): Promise<UploadResult> {
  validateImageFile(file);

  const extension = file.name.split('.').pop() || 'png';
  const fileName = `logo_${Date.now()}.${extension}`;
  const storagePath = `company/${fileName}`;

  try {
    const storageRef = ref(storage, storagePath);
    const metadata = {
      contentType: file.type,
      customMetadata: {
        category: 'company-branding',
        uploadedAt: new Date().toISOString(),
      },
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const url = await getDownloadURL(snapshot.ref);

    return { url, storagePath };
  } catch (err: any) {
    console.error('Firebase Storage upload error for company logo:', err);
    throw new Error(
      err.message || 'Failed to upload company logo to Firebase Storage.'
    );
  }
}

/**
 * Safely deletes a file from Firebase Storage if it belongs to Firebase Storage.
 */
export async function deleteStorageFile(fileUrlOrPath: string): Promise<boolean> {
  if (!fileUrlOrPath || !fileUrlOrPath.includes('firebasestorage.googleapis.com')) {
    return false; // Not a Firebase Storage URL
  }

  try {
    const storageRef = ref(storage, fileUrlOrPath);
    await deleteObject(storageRef);
    return true;
  } catch (err) {
    console.warn('Could not delete prior storage file:', err);
    return false;
  }
}
