import { api } from './api.ts';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
  url: string;
  storagePath?: string;
  publicId?: string;
}

/**
 * Validates image type and size according to corporate policies.
 * Supported formats: JPEG, PNG, WebP, GIF, SVG (up to 5MB).
 */
export function validateImageFile(file: File): void {
  if (!file) {
    throw new Error('Please select an image file to upload.');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file format. Please upload a JPEG, PNG, WebP, GIF, or SVG image.');
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image file is too large. Maximum allowed size is 5MB.');
  }
}

/**
 * Converts a browser File object to a Base64 Data URI string.
 */
export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URI.'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading local file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an employee profile photo to Cloudinary via the authenticated backend.
 * Stored under Cloudinary folder: UHF-Solutions/profile-photos/{employeeId}
 * Returns secure HTTPS Cloudinary URL.
 */
export async function uploadProfilePhoto(
  file: File,
  employeeId?: string
): Promise<UploadResult> {
  validateImageFile(file);

  try {
    const dataUri = await fileToDataUri(file);
    const result = await api.upload.employeePhoto(dataUri, employeeId, file.name);

    return {
      url: result.url,
      storagePath: result.publicId,
      publicId: result.publicId,
    };
  } catch (err: any) {
    console.error('Cloudinary profile photo upload error:', err);
    throw new Error(err.message || 'Failed to upload photo to Cloudinary.');
  }
}

/**
 * Uploads corporate logo to Cloudinary via the authenticated backend.
 * Stored under Cloudinary folder: UHF-Solutions/company
 * Returns secure HTTPS Cloudinary URL.
 */
export async function uploadCompanyLogo(file: File): Promise<UploadResult> {
  validateImageFile(file);

  try {
    const dataUri = await fileToDataUri(file);
    const result = await api.upload.companyLogo(dataUri, file.name);

    return {
      url: result.url,
      storagePath: result.publicId,
      publicId: result.publicId,
    };
  } catch (err: any) {
    console.error('Cloudinary corporate logo upload error:', err);
    throw new Error(err.message || 'Failed to upload company logo to Cloudinary.');
  }
}

/**
 * Legacy storage file deletion helper.
 * Assets are now deleted automatically by the Cloudinary backend when replaced.
 */
export async function deleteStorageFile(_fileUrlOrPath: string): Promise<boolean> {
  return true;
}
