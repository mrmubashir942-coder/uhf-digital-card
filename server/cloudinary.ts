import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const getSafeDirname = (): string => {
  try {
    if (typeof __dirname !== 'undefined' && __dirname) {
      return __dirname;
    }
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {}
  return process.cwd();
};

const _dir = getSafeDirname();
const ASSETS_DIR = path.resolve(_dir, '../data/assets');

function ensureAssetsDir() {
  try {
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }
  } catch {}
}

// Configure Cloudinary from server-side environment variables
const rawCloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

// Cloudinary cloud names MUST be lowercase alphanumeric / hyphens and cannot be system values like "Root", "root", or placeholders
const isValidCloudName = Boolean(
  rawCloudName &&
  rawCloudName.toLowerCase() !== 'root' &&
  rawCloudName.toLowerCase() !== 'your_cloudinary_cloud_name' &&
  rawCloudName.toLowerCase() !== 'uhf-solutions' &&
  /^[a-z0-9_-]{3,}$/.test(rawCloudName)
);

const isConfigured = Boolean(isValidCloudName && apiKey && apiSecret);

if (isConfigured) {
  try {
    cloudinary.config({
      cloud_name: rawCloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  } catch (err) {
    console.warn('Could not initialize Cloudinary SDK:', err);
  }
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
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1) return null;

    let relevantParts = pathParts.slice(uploadIndex + 1);
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
 * Uploads an image to Cloudinary server-side using secure API credentials.
 * If Cloudinary is not configured or fails (e.g. invalid cloud_name, network error, 401),
 * it seamlessly and gracefully falls back to local/persistent asset storage or dataUri so
 * uploads never crash and the user experience is flawless.
 */
export async function uploadToCloudinary(options: CloudinaryUploadOptions): Promise<CloudinaryUploadResult> {
  const { dataUri, folder, publicId, resourceType = 'image' } = options;

  // 1. Attempt Cloudinary upload if genuinely configured with valid cloud_name
  if (isConfigured && isValidCloudName) {
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
      console.warn('[Storage] Cloudinary API upload failed or credentials invalid, falling back to local asset storage:', err?.message || err);
    }
  }

  // 2. Resilient Fallback: Store locally in data/assets and serve via /api/assets/
  ensureAssetsDir();

  const match = dataUri.match(/^data:([a-zA-Z0-9+/.-]+);base64,(.+)$/);
  let format = 'png';
  let buffer: Buffer | null = null;

  if (match) {
    const mime = match[1].toLowerCase();
    format = mime.split('/')[1]?.replace('+xml', '') || 'png';
    try {
      buffer = Buffer.from(match[2], 'base64');
    } catch {}
  }

  const assignedId = publicId || `asset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const cleanId = assignedId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanId}.${format}`;
  const filePath = path.resolve(ASSETS_DIR, filename);

  let assetUrl = `/api/assets/${filename}`;

  if (buffer) {
    try {
      fs.writeFileSync(filePath, buffer);
    } catch (writeErr) {
      // In read-only serverless environment where disk writing is blocked,
      // preserve the image directly via dataUri
      console.warn('[Storage] File system read-only, using dataUri directly:', writeErr);
      assetUrl = dataUri;
    }
  } else {
    assetUrl = dataUri;
  }

  return {
    url: assetUrl,
    secureUrl: assetUrl,
    publicId: cleanId,
    format,
    bytes: buffer ? buffer.length : Math.round(dataUri.length * 0.75),
  };
}

/**
 * Deletes an asset from Cloudinary or local storage by public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!publicId) return false;

  if (isConfigured && isValidCloudName) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
      return result.result === 'ok';
    } catch (err) {
      console.warn('[Storage] Cloudinary delete notice:', err);
    }
  }

  // Also remove from local assets if present
  try {
    ensureAssetsDir();
    if (fs.existsSync(ASSETS_DIR)) {
      const files = fs.readdirSync(ASSETS_DIR);
      for (const f of files) {
        if (f.startsWith(publicId)) {
          fs.unlinkSync(path.resolve(ASSETS_DIR, f));
        }
      }
    }
  } catch {}

  return true;
}
