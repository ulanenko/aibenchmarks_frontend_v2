import {secondaryDb} from '../../database/secondaryConnection';
import {searchedCompany} from '../../database/secondarySchema';
import {inArray} from 'drizzle-orm';

/**
 * Retrieves multiple searched companies by their search_ids
 * @param searchIds - Array of search_ids to retrieve
 * @returns Array of searched company data
 */
export async function getMultipleSearchedCompanies(searchIds: string[]) {
	if (!searchIds.length) {
		return [];
	}

	try {
		// Using drizzle's inArray to query multiple search_ids
		const results = await secondaryDb
			.select()
			.from(searchedCompany)
			.where(inArray(searchedCompany.search_id, searchIds));

		return results;
	} catch (error) {
		console.error('Error retrieving multiple searched companies:', error);
		throw new Error(`Failed to retrieve searched companies with search_ids: ${searchIds.join(', ')}`);
	}
}
