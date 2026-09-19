import { apiClient } from '../api-client';

export interface PresignedSignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadUrl: string;
  publicId?: string;
}

export const mediaService = {
  /**
   * Request presigned signature from Aurora Backend
   */
  async getPresignedUrl(folder = 'aurora/moments'): Promise<PresignedSignatureResponse> {
    return apiClient.post<PresignedSignatureResponse>('/media/presigned-url', {
      folder,
    });
  },

  /**
   * Upload image directly to Cloudinary using Presigned Signature
   */
  async uploadImage(localUri: string, folder = 'aurora/moments'): Promise<string> {
    try {
      const presigned = await this.getPresignedUrl(folder);

      // If Cloudinary is not configured on the backend during local dev (dummy keys)
      if (!presigned.apiKey || !presigned.signature || presigned.uploadUrl.includes('undefined')) {
        console.warn('Cloudinary credentials not configured on backend, using local URI fallback');
        return localUri;
      }

      const filename = localUri.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('file', {
        uri: localUri,
        name: filename,
        type,
      } as any);
      formData.append('api_key', presigned.apiKey);
      formData.append('timestamp', String(presigned.timestamp));
      formData.append('signature', presigned.signature);
      formData.append('folder', presigned.folder);

      const response = await fetch(presigned.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.secure_url) {
        throw new Error(json?.error?.message || 'Cloudinary upload failed');
      }

      return json.secure_url as string;
    } catch (error) {
      console.warn('Direct upload to Cloudinary failed, falling back to local URI', error);
      return localUri;
    }
  },
};
