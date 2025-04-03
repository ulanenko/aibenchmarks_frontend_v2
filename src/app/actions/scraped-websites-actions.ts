'use server';

import { getScrapedWebsites } from '@/services/backend/queries/searchedcompany/getScrapedWebsites';

/**
 * Server action to fetch scraped websites for a given search_id
 * @param searchId - The search_id to retrieve scraped websites for
 * @returns Array of scraped websites
 */
export async function fetchScrapedWebsites(searchId: string) {
    try {
        return await getScrapedWebsites(searchId);
    } catch (error) {
        console.error('Error fetching scraped websites:', error);
        throw new Error('Failed to fetch scraped websites');
    }
} 