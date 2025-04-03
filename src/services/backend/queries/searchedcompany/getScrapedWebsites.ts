import {secondaryDb} from '../../database/secondaryConnection';
import {scrapedWebsite} from '../../database/secondarySchema';
import {eq} from 'drizzle-orm';

export interface ScrapedWebsite {
    id: number;
    searched_company: string | null;
    url: string | null;
    content: string | null;
    screenshot: string | null;
    search_id: string | null;
    auth_code: string | null;
    accessed_on: Date | null;
    screenshot_status: string | null;
    page_title: string | null;
}

/**
 * Retrieves scraped websites for a given search_id from the secondary database
 * @param searchId - The search_id to retrieve scraped websites for
 * @returns Array of scraped websites or empty array if none found
 */
export async function getScrapedWebsites(searchId: string): Promise<ScrapedWebsite[]> {
    try {
        const websites = await secondaryDb
            .select()
            .from(scrapedWebsite)
            .where(eq(scrapedWebsite.search_id, searchId));

        return websites;
    } catch (error) {
        console.error('Error retrieving scraped websites:', error);
        throw new Error(`Failed to retrieve scraped websites for search_id: ${searchId}`);
    }
} 