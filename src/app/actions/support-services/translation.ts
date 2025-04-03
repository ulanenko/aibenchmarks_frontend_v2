'use server';

import { translateText } from '@/services/support-services';

/**
 * Server action to translate text to a target language
 * @param text The text to translate
 * @param targetLanguage The target language code (e.g., 'en', 'fr', 'de')
 * @returns The translated text or error message
 */
export async function translateTextAction(
  text: string,
  targetLanguage: string
): Promise<{ data: string | null; error: string | null }> {
  try {
    if (!text || !targetLanguage) {
      return { data: null, error: 'Text and target language are required' };
    }

    // Call the translation service
    const translatedText = await translateText({
      text,
      target_language: targetLanguage
    });

    if (translatedText === null) {
      return { data: null, error: 'Failed to translate text' };
    }

    return { data: translatedText, error: null };
  } catch (error) {
    console.error('Error translating text:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
} 