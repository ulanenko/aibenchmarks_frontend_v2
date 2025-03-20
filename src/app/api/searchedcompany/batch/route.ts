import {NextResponse} from 'next/server';
import {getMultipleCompaniesWithSiteMatches} from '@/services/backend/queries/searchedcompany';

/**
 * API route to get multiple searched companies with site match data
 *
 * POST /api/searchedcompany/batch
 * Body: { searchIds: string[] }
 */
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {searchIds} = body;

		if (!searchIds || !Array.isArray(searchIds) || searchIds.length === 0) {
			return NextResponse.json({error: 'Array of search IDs is required'}, {status: 400});
		}

		// Limit the number of IDs that can be queried at once
		const MAX_BATCH_SIZE = 50;
		if (searchIds.length > MAX_BATCH_SIZE) {
			return NextResponse.json(
				{error: `Maximum of ${MAX_BATCH_SIZE} search IDs can be queried at once`},
				{status: 400},
			);
		}

		const companies = await getMultipleCompaniesWithSiteMatches(searchIds);

		return NextResponse.json({
			total: companies.length,
			companies: companies,
		});
	} catch (error) {
		console.error('Error fetching multiple searched companies:', error);
		return NextResponse.json({error: 'Failed to fetch companies data'}, {status: 500});
	}
}
