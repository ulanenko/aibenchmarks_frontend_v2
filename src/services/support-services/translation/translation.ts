import { SUPPORT_SERVICES_CONFIG } from '@/config/env';
import { TranslateRequest, TranslateRawResponse } from './types';

/**
 * Translates text to a target language using the support services API
 * @param input The translation request with text and target language
 * @returns The translated text or null if the API call fails
 */
export async function translateText(input: TranslateRequest): Promise<string | null> {
  const apiUrl = `${SUPPORT_SERVICES_CONFIG.URL}/translate`;
  
  try {
    // Check if the auth token is configured
    if (!SUPPORT_SERVICES_CONFIG.AUTH_TOKEN) {
      console.error('Translation Service: Auth token not configured');
      return null;
    }

    console.log(`Translation Service: Calling API at ${apiUrl}`);

    // Make the API call
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: SUPPORT_SERVICES_CONFIG.AUTH_TOKEN,
      },
      body: JSON.stringify(input),
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Translation Service: API call failed with status ${response.status}:`, errorText);
      return null;
    }

    // Parse the response
    const result: TranslateRawResponse = await response.json();
    
    console.log('Translation Service: API call successful');
    return result.translated_text || null;
  } catch (error) {
    console.error(`Translation Service: Error calling API at ${apiUrl}:`, error);
    return null;
  }
} 