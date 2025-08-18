// TEMPORARY: Storage service disabled for initial deployment
// TODO: Re-enable after core app is deployed and working

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Stub implementation - no AWS dependencies
export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async uploadFile(): Promise<UploadResult> {
    console.log('File upload disabled - AWS S3 not configured');
    return { success: false, error: 'File upload not available' };
  }

  async deleteFile(): Promise<boolean> {
    console.log('File delete disabled - AWS S3 not configured');
    return false;
  }

  async getSignedUrl(): Promise<string | null> {
    console.log('Signed URL disabled - AWS S3 not configured');
    return null;
  }

  async uploadScenarioImage(): Promise<UploadResult> {
    return this.uploadFile();
  }

  async uploadScenarioVideo(): Promise<UploadResult> {
    return this.uploadFile();
  }

  async uploadUserAvatar(): Promise<UploadResult> {
    return this.uploadFile();
  }

  generateUploadKey(category: string, id: string, filename: string): string {
    const timestamp = Date.now();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${category}/${id}/${timestamp}_${cleanFilename}`;
  }
}

export const storageService = StorageService.getInstance();

// File upload validation (keep this - no dependencies)
export const validateFileUpload = (
  file: File,
  maxSizeMB: number = 10,
  allowedTypes: string[] = []
) => {
  const errors: string[] = [];

  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const ImageFileValidator = (file: File) =>
  validateFileUpload(file, 5, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

export const VideoFileValidator = (file: File) =>
  validateFileUpload(file, 100, ['video/mp4', 'video/mpeg', 'video/quicktime']);

export const DocumentFileValidator = (file: File) =>
  validateFileUpload(file, 10, ['application/pdf', 'text/plain', 'application/msword']);
