import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { v2 as cloudinary } from 'cloudinary';
import { MediaService } from './media.service.js';
import { MediaFolder } from './dto/generate-presigned-url.dto.js';

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
    process.env.CLOUDINARY_API_KEY = 'test_key';
    process.env.CLOUDINARY_API_SECRET = 'test_secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaService],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePresignedSignature', () => {
    it('should generate valid presigned signature object', () => {
      vi.spyOn(cloudinary.utils, 'api_sign_request').mockReturnValue('mocked_signature_123');

      const result = service.generatePresignedSignature({
        folder: MediaFolder.MOMENTS,
        publicId: 'moment_abc',
      });

      expect(result).toHaveProperty('signature', 'mocked_signature_123');
      expect(result).toHaveProperty('apiKey', 'test_key');
      expect(result).toHaveProperty('cloudName', 'test_cloud');
      expect(result).toHaveProperty('uploadUrl', 'https://api.cloudinary.com/v1_1/test_cloud/image/upload');
      expect(result).toHaveProperty('folder', MediaFolder.MOMENTS);
      expect(result).toHaveProperty('publicId', 'moment_abc');
      expect(result).toHaveProperty('timestamp');
    });

    it('should generate signature with default folder if not provided', () => {
      vi.spyOn(cloudinary.utils, 'api_sign_request').mockReturnValue('mocked_signature_456');

      const result = service.generatePresignedSignature({});

      expect(result.signature).toBe('mocked_signature_456');
      expect(result.folder).toBe(MediaFolder.MOMENTS);
      expect(result).not.toHaveProperty('publicId');
    });
  });
});
