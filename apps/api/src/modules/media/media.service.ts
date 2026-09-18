import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { GeneratePresignedUrlDto, MediaFolder } from './dto/generate-presigned-url.dto.js';

@Injectable()
export class MediaService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  generatePresignedSignature(dto: GeneratePresignedUrlDto) {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = dto.folder || MediaFolder.MOMENTS;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '';
    const apiKey = process.env.CLOUDINARY_API_KEY || '';
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';

    const paramsToSign: Record<string, string | number> = {
      folder,
      timestamp,
    };

    if (dto.publicId) {
      paramsToSign.public_id = dto.publicId;
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return {
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      ...(dto.publicId && { publicId: dto.publicId }),
    };
  }
}
