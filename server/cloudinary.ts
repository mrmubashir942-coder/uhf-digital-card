import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from server-side environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export interface CloudinaryUploadOptions {
  dataUri: string;
  folder: string;
  publicId?: string;
  resourceType?: 'image' | 'raw' | 'auto';
}

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
}

/**
 * Extracts Cloudinary public ID from a Cloudinary URL
 * Example URL: https://res.cloudinary.com/demo/image/upload/v12345/UHF-Solutions/company/logo_123.png
 * Extracted publicId: UHF-Solutions/company/logo_123
 */
export function extractCloudinaryPublicId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('cloudinary.com')) return null;

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Path looks like /<cloud_name>/image/upload/[v12345/]<folder>/<subfolder>/<filename>.<ext>
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1) return null;

    let relevantParts = pathParts.slice(uploadIndex + 1);
    // Remove version prefix if present (e.g., v12345)
    if (relevantParts[0] && /^v\d+$/.test(relevantParts[0])) {
      relevantParts = relevantParts.slice(1);
    }

    if (relevantParts.length === 0) return null;

    const fullPathWithExt = relevantParts.join('/');
    const dotIndex = fullPathWithExt.lastIndexOf('.');
    if (dotIndex !== -1) {
      return fullPathWithExt.substring(0, dotIndex);
    }
    return fullPathWithExt;
  } catch (err) {
    console.warn('Failed to parse Cloudinary URL for public ID:', err);
    return null;
  }
}

/**
 * Uploads an image to Cloudinary server-side using secure API credentials
 */
export async function uploadToCloudinary(options: CloudinaryUploadOptions): Promise<CloudinaryUploadResult> {
  const { dataUri, folder, publicId, resourceType = 'image' } = options;

  if (isConfigured) {
    try {
      const uploadParams: any = {
        folder,
        resource_type: resourceType,
        overwrite: true,
        invalidate: true,
      };

      if (publicId) {
        uploadParams.public_id = publicId;
      }

      const res = await cloudinary.uploader.upload(dataUri, uploadParams);

      return {
        url: res.secure_url,
        secureUrl: res.secure_url,
        publicId: res.public_id,
        format: res.format,
        bytes: res.bytes,
      };
    } catch (err: any) {
      console.error('Cloudinary API upload error:', err);
      throw new Error(err.message || 'Failed to upload image to Cloudinary.');
    }
  }

  // Fallback for local testing/development when credentials are not yet added to Secrets panel
  console.info('Notice: Cloudinary credentials not configured in environment. Using simulated Cloudinary storage response.');
  
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const assignedId = publicId || `asset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const resolvedPublicId = `${cleanFolder}/${assignedId}`;
  
  // Detect format from data URI if present
  let format = 'png';
  const mimeMatch = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
  if (mimeMatch && mimeMatch[1]) {
    format = mimeMatch[1] === 'svg+xml' ? 'svg' : mimeMatch[1];
  }

  const simulatedCloud = cloudName || 'uhf-solutions';
  const secureUrl = `https://res.cloudinary.com/${simulatedCloud}/image/upload/v${Date.now()}/${resolvedPublicId}.${format}`;

  return {
    url: secureUrl,
    secureUrl,
    publicId: resolvedPublicId,
    format,
    bytes: Math.round(dataUri.length * 0.75),
  };
}

/**
 * Deletes an asset from Cloudinary by public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!publicId) return false;

  if (isConfigured) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
      return result.result === 'ok';
    } catch (err) {
      console.warn('Failed to delete asset from Cloudinary:', err);
      return false;
    }
  }

  console.info(`Simulated Cloudinary asset deletion for publicId: ${publicId}`);
  return true;
}
