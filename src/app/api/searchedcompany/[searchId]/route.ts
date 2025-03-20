import {NextResponse} from 'next/server';
import {getSearchedCompanyWithSiteMatch} from '@/services/backend/queries/searchedcompany';

/**
 * API route to get a searched company with site match data by search_id
 *
 * GET /api/searchedcompany/:searchId
 */
export async function GET(request: Request, {params}: {params: {searchId: string}}) {
	try {
		const {searchId} = params;

		if (!searchId) {
			return NextResponse.json({error: 'Search ID is required'}, {status: 400});
		}

		const company = await getSearchedCompanyWithSiteMatch(searchId);

		if (!company) {
			return NextResponse.json({error: 'Company not found'}, {status: 404});
		}

		return NextResponse.json(company);
	} catch (error) {
		console.error('Error fetching searched company:', error);
		return NextResponse.json({error: 'Failed to fetch company data'}, {status: 500});
	}
}
