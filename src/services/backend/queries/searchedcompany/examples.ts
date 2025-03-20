/**
 * Examples of how to use the SearchedCompany query functions
 *
 * This file is meant for demonstration purposes only and shouldn't be used in production.
 */

import {
	getSearchedCompanyBySearchId,
	getSearchedCompanyWithSiteMatch,
	getMultipleSearchedCompanies,
	getMultipleCompaniesWithSiteMatches,
} from './index';

/**
 * Example: Fetching a single company by search_id
 */
async function fetchSingleCompany(searchId: string) {
	try {
		const company = await getSearchedCompanyBySearchId(searchId);

		if (!company) {
			console.log(`No company found with search_id: ${searchId}`);
			return;
		}

		console.log('Found company:', company.searched_company);
		console.log('Country:', company.country);
		console.log('Website:', company.website);

		return company;
	} catch (error) {
		console.error('Error in fetchSingleCompany:', error);
	}
}

/**
 * Example: Fetching a company with its site match data
 */
async function fetchCompanyWithSiteMatch(searchId: string) {
	try {
		const companyWithSiteMatch = await getSearchedCompanyWithSiteMatch(searchId);

		if (!companyWithSiteMatch) {
			console.log(`No company found with search_id: ${searchId}`);
			return;
		}

		console.log('Found company:', companyWithSiteMatch.searched_company);

		if (companyWithSiteMatch.siteMatch) {
			console.log('Site match status:', companyWithSiteMatch.siteMatch.status);
			console.log('Overall result:', companyWithSiteMatch.siteMatch.overall_result);
		} else {
			console.log('No site match data available for this company');
		}

		return companyWithSiteMatch;
	} catch (error) {
		console.error('Error in fetchCompanyWithSiteMatch:', error);
	}
}

/**
 * Example: Fetching multiple companies by search_ids
 */
async function fetchMultipleCompanies(searchIds: string[]) {
	try {
		const companies = await getMultipleSearchedCompanies(searchIds);

		console.log(`Found ${companies.length} companies`);

		companies.forEach((company) => {
			console.log('--------------------------');
			console.log('Company:', company.searched_company);
			console.log('Country:', company.country);
			console.log('Website:', company.website);
		});

		return companies;
	} catch (error) {
		console.error('Error in fetchMultipleCompanies:', error);
	}
}

/**
 * Example: Fetching multiple companies with their site match data in an efficient way
 */
async function fetchMultipleCompaniesWithSiteMatches(searchIds: string[]) {
	try {
		const companiesWithSiteMatches = await getMultipleCompaniesWithSiteMatches(searchIds);

		console.log(`Found ${companiesWithSiteMatches.length} companies with site match data`);

		companiesWithSiteMatches.forEach((company) => {
			console.log('--------------------------');
			console.log('Company:', company.searched_company);
			console.log('Country:', company.country);

			if (company.siteMatch) {
				console.log('Site match status:', company.siteMatch.status);
				console.log('Overall result:', company.siteMatch.overall_result);
			} else {
				console.log('No site match data available for this company');
			}
		});

		return companiesWithSiteMatches;
	} catch (error) {
		console.error('Error in fetchMultipleCompaniesWithSiteMatches:', error);
	}
}

// How to use in your application (examples only)
// fetchSingleCompany('abc123');
// fetchCompanyWithSiteMatch('abc123');
// fetchMultipleCompanies(['abc123', 'def456', 'ghi789']);
// fetchMultipleCompaniesWithSiteMatches(['abc123', 'def456', 'ghi789']);
