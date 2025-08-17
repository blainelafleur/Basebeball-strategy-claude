// Conditional imports to prevent build errors if AWS is not configured
const hasAWSConfig = () => 
  process.env.AWS_ACCESS_KEY_ID && 
  process.env.AWS_SECRET_ACCESS_KEY;

// Lazy initialization of AWS SDK
let s3Client: unknown = null;
let awsInitialized = false;

const initializeAWS = async () => {
  if (awsInitialized) return s3Client;
  
  if (!hasAWSConfig()) {
    console.log('AWS storage not configured - file upload disabled');
    awsInitialized = true;
    return null;
  }

  try {
    const { S3Client } = await import('@aws-sdk/client-s3');
    
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    
    awsInitialized = true;
    console.log('AWS S3 storage initialized');
    return s3Client;
  } catch (error) {
    console.warn('Failed to initialize AWS S3:', error);
    awsInitialized = true;
    return null;
  }
};

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class StorageService {
  private static instance: StorageService;
  private bucket: string;

  private constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || 'baseball-strategy-assets';
  }

  private async getS3Client() {
    return await initializeAWS();
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async uploadFile(
    file: Buffer | Uint8Array,
    key: string,
    contentType: string = 'application/octet-stream',
    isPublic: boolean = false
  ): Promise<UploadResult> {
    const s3 = await this.getS3Client();
    
    if (!s3) {
      return { success: false, error: 'AWS S3 storage not configured' };
    }

    try {
      const { PutObjectCommand } = await import('@aws-sdk/client-s3');
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        ...(isPublic && { ACL: 'public-read' }),
      });

      await s3.send(command);

      const url = isPublic 
        ? `https://${this.bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
        : await this.getSignedUrl(key);

      return { success: true, url };
    } catch (error) {
      console.error('File upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    const s3 = await this.getS3Client();
    
    if (!s3) {
      console.warn('AWS S3 storage not configured');
      return false;
    }

    try {
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await s3.send(command);
      return true;
    } catch (error) {
      console.error('File delete error:', error);
      return false;
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
    const s3 = await this.getS3Client();
    
    if (!s3) {
      return null;
    }

    try {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(s3, command, { expiresIn });
    } catch (error) {
      console.error('Signed URL error:', error);
      return null;
    }
  }

  // Helper methods for common upload types
  async uploadScenarioImage(imageBuffer: Buffer, scenarioId: string, imageType: string): Promise<UploadResult> {
    const extension = imageType.split('/')[1] || 'jpg';
    const key = `scenarios/${scenarioId}/image.${extension}`;
    
    return this.uploadFile(imageBuffer, key, imageType, true);
  }

  async uploadScenarioVideo(videoBuffer: Buffer, scenarioId: string): Promise<UploadResult> {
    const key = `scenarios/${scenarioId}/video.mp4`;
    
    return this.uploadFile(videoBuffer, key, 'video/mp4', true);
  }

  async uploadUserAvatar(imageBuffer: Buffer, userId: string, imageType: string): Promise<UploadResult> {
    const extension = imageType.split('/')[1] || 'jpg';
    const key = `users/${userId}/avatar.${extension}`;
    
    return this.uploadFile(imageBuffer, key, imageType, true);
  }

  generateUploadKey(category: string, id: string, filename: string): string {
    const timestamp = Date.now();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${category}/${id}/${timestamp}_${cleanFilename}`;
  }
}

export const storageService = StorageService.getInstance();

// File upload validation
export const validateFileUpload = (file: File, maxSizeMB: number = 10, allowedTypes: string[] = []) => {
  const errors: string[] = [];

  // Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Common file type validators
export const ImageFileValidator = (file: File) => 
  validateFileUpload(file, 5, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

export const VideoFileValidator = (file: File) => 
  validateFileUpload(file, 100, ['video/mp4', 'video/mpeg', 'video/quicktime']);

export const DocumentFileValidator = (file: File) => 
  validateFileUpload(file, 10, ['application/pdf', 'text/plain', 'application/msword']);