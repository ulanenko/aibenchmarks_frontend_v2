import {secondaryDb} from '../../database/secondaryConnection';
import {searchedCompany, siteMatch} from '../../database/secondarySchema';
import {inArray} from 'drizzle-orm';

type SiteMatchType = typeof siteMatch.$inferSelect;

/**
 * Retrieves multiple searched companies with their associated site match data in an efficient way
 * @param searchIds - Array of search_ids to retrieve
 * @returns Array of searched companies with their site match data
 */
export async function getMultipleCompaniesWithSiteMatches(searchIds: string[]) {
	if (!searchIds.length) {
		return [];
	}

	try {
		// Get all companies
		const companies = await secondaryDb
			.select()
			.from(searchedCompany)
			.where(inArray(searchedCompany.search_id, searchIds));

		if (companies.length === 0) {
			return [];
		}

		// Get all site matches for these companies in a single query
		const siteMatches = await secondaryDb.select().from(siteMatch).where(inArray(siteMatch.search_id, searchIds));

		// Create a map of search_id to site match for efficient lookups
		const siteMatchMap = new Map<string, SiteMatchType>();
		for (const match of siteMatches) {
			if (match.search_id) {
				siteMatchMap.set(match.search_id, match);
			}
		}

		// Combine the results
		return companies.map((company) => ({
			...company,
			siteMatch: company.search_id ? siteMatchMap.get(company.search_id) || null : null,
		}));
	} catch (error) {
		console.error('Error retrieving multiple companies with site matches:', error);
		throw new Error(`Failed to retrieve companies with site matches for search_ids: ${searchIds.join(', ')}`);
	}
}
