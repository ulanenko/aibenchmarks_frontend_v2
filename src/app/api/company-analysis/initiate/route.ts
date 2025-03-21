import {NextResponse} from 'next/server';
import {initiateCompanyAnalysis} from '@/services/backend/api/searchcompany';
import {AnalyzeCompanyInput} from '@/services/backend/api/searchcompany/types';

/**
 * API route to initiate company analysis
 *
 * POST /api/company-analysis/initiate
 * Body: AnalyzeCompanyInput object
 */
export async function POST(request: Request) {
	try {
		// Parse the request body
		const body = await request.json();

		// Validate the request
		if (!body.auth_code || !body.analysis || !Array.isArray(body.analysis) || body.analysis.length === 0) {
			return NextResponse.json(
				{error: 'Invalid request. Must include auth_code and non-empty analysis array.'},
				{status: 400},
			);
		}

		// Type the input correctly
		const analyzeCompanyInput: AnalyzeCompanyInput = body;

		// Initiate the company analysis
		const result = await initiateCompanyAnalysis(analyzeCompanyInput);

		if (!result) {
			return NextResponse.json({error: 'Failed to initiate company analysis'}, {status: 500});
		}

		// Return the result
		return NextResponse.json(result);
	} catch (error) {
		console.error('Error in company analysis initiation API:', error);
		return NextResponse.json({error: 'Failed to process the request'}, {status: 500});
	}
}
