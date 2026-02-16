/**
 * File upload API endpoints
 */

import { apiClient } from '../api-client';
import type { UploadResponse } from '../api-types';

/**
 * Upload an image file
 */
export async function uploadImage(file: File): Promise<UploadResponse> {
  return apiClient.uploadFile('/upload/image', file);
}

/**
 * Delete an image file
 */
export async function deleteImage(url: string): Promise<{ success: boolean; message: string }> {
  return apiClient.delete(`/upload/image?url=${encodeURIComponent(url)}`);
}
