/**
 * Newsletter subscription API endpoints
 */

import { apiClient } from '../api-client';
import type { NewsletterSubscription, SubscribeNewsletterRequest } from '../api-types';

/**
 * Subscribe to newsletter
 */
export async function subscribeNewsletter(data: SubscribeNewsletterRequest): Promise<NewsletterSubscription> {
  return apiClient.post<NewsletterSubscription>('/newsletter/subscribe', data);
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeNewsletter(email: string): Promise<{ message: string }> {
  return apiClient.post('/newsletter/unsubscribe', { email });
}
