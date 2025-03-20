import {secondaryDb} from '../../database/secondaryConnection';
import {searchedCompany, siteMatch} from '../../database/secondarySchema';
import {eq} from 'drizzle-orm';

/**
 * Retrieves a searched company along with its associated site match data by search_id
 * @param searchId - The search_id of the company to retrieve
 * @returns The searched company data with site match or null if not found
 */
export async function getSearchedCompanyWithSiteMatch(searchId: string) {
	try {
		const companyResults = await secondaryDb
			.select()
			.from(searchedCompany)
			.where(eq(searchedCompany.search_id, searchId))
			.limit(1);

		if (companyResults.length === 0) {
			return null;
		}

		const company = companyResults[0];

		// Get the associated site match
		const siteMatchResults = await secondaryDb
			.select()
			.from(siteMatch)
			.where(eq(siteMatch.search_id, searchId))
			.limit(1);

		// Return the combined result
		return {
			...company,
			siteMatch: siteMatchResults.length > 0 ? siteMatchResults[0] : null,
		};
	} catch (error) {
		console.error('Error retrieving searched company with site match:', error);
		throw new Error(`Failed to retrieve searched company with site match for search_id: ${searchId}`);
	}
}
