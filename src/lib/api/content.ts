const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface ContentSection {
  id: string;
  title: string;
  content: string;
  subsections?: {
    id: string;
    title: string;
    content: string;
  }[];
}

export interface ContentResponse {
  sections: ContentSection[];
  lastUpdated: string;
  version: string;
}

export async function getPrivacyPolicy(): Promise<ContentResponse> {
  const response = await fetch(`${API_BASE_URL}/content/privacy`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch privacy policy');
  }
  
  return response.json();
}

export async function getTermsOfService(): Promise<ContentResponse> {
  const response = await fetch(`${API_BASE_URL}/content/terms`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch terms of service');
  }
  
  return response.json();
}

export async function updateContent(
  type: 'privacy-policy' | 'terms-of-service',
  sections: ContentSection[],
  version: string,
  token: string
): Promise<ContentResponse> {
  const response = await fetch(`${API_BASE_URL}/content/admin/${type}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ sections, version })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update content');
  }
  
  return response.json();
}
