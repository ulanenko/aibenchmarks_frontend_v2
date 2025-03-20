import {secondaryDb} from '../../database/secondaryConnection';
import {searchedCompany} from '../../database/secondarySchema';
import {eq} from 'drizzle-orm';

/**
 * Retrieves a searched company by its search_id
 * @param searchId - The search_id of the company to retrieve
 * @returns The searched company data or null if not found
 */
export async function getSearchedCompanyBySearchId(searchId: string) {
	try {
		const result = await secondaryDb
			.select()
			.from(searchedCompany)
			.where(eq(searchedCompany.search_id, searchId))
			.limit(1);

		return result.length > 0 ? result[0] : null;
	} catch (error) {
		console.error('Error retrieving searched company:', error);
		throw new Error(`Failed to retrieve searched company with search_id: ${searchId}`);
	}
}
