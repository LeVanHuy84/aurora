import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';
import { apiClient } from '../api-client';
import { MediaFolder, PresignedSignatureResponse } from '@aurora/types';

export const mediaService = {
  /**
   * Request presigned signature from Aurora Backend
   */
  async getPresignedUrl(
    folder: MediaFolder | 'moments' | 'avatars' = MediaFolder.MOMENTS,
  ): Promise<PresignedSignatureResponse> {
    return apiClient.post<PresignedSignatureResponse>('/media/presigned-url', {
      folder,
    });
  },

  /**
   * Upload image directly to Cloudinary using Native FileSystem Upload
   */
  async uploadImage(
    localUri: string,
    folder: MediaFolder | 'moments' | 'avatars' = MediaFolder.MOMENTS,
  ): Promise<string> {
    try {
      const presigned = await this.getPresignedUrl(folder);

      // If Cloudinary is not configured on the backend during local dev (dummy keys)
      if (!presigned.apiKey || !presigned.signature || presigned.uploadUrl.includes('undefined')) {
        console.warn('Cloudinary credentials not configured on backend, using local URI fallback');
        return localUri;
      }

      // Use native uploadAsync to stream the file directly without JS Blob/FormData bottlenecks
      const uploadResult = await uploadAsync(
        presigned.uploadUrl,
        localUri,
        {
          fieldName: 'file',
          httpMethod: 'POST',
          uploadType: FileSystemUploadType.MULTIPART,
          parameters: {
            api_key: presigned.apiKey,
            timestamp: String(presigned.timestamp),
            signature: presigned.signature,
            folder: presigned.folder,
          },
        },
      );

      const json = JSON.parse(uploadResult.body);

      if (uploadResult.status < 200 || uploadResult.status >= 300 || !json.secure_url) {
        throw new Error(json?.error?.message || `Cloudinary upload failed with status ${uploadResult.status}`);
      }

      return json.secure_url as string;
    } catch (error) {
      console.warn('Direct upload to Cloudinary failed, falling back to local URI', error);
      return localUri;
    }
  },
};

