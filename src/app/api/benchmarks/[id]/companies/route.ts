'use server';

import {NextRequest, NextResponse} from 'next/server';
import type {CompanyDBType, CompanyDTO, CreateCompanyDTO, UpdateCompanyDTO} from '@/lib/company/type';
import * as companyService from '@/services/server/company-service.server';

type RouteParams = {id: string};
type RouteContext = {params: Promise<RouteParams>};

export async function GET(
	request: NextRequest,
	context: RouteContext,
): Promise<NextResponse<{error: string} | {companies: CompanyDTO[]}>> {
	try {
		const params = await context.params;
		const benchmarkId = parseInt(params.id);
		const companies = await companyService.getCompaniesByBenchmarkId(benchmarkId);
		return NextResponse.json({companies: companies as CompanyDTO[]});
	} catch (error) {
		console.error('Error fetching companies:', error);
		return NextResponse.json(
			{error: error instanceof Error ? error.message : 'Failed to fetch companies'},
			{status: 500},
		);
	}
}

export async function POST(
	request: NextRequest,
	{params}: {params: {id: string}},
): Promise<NextResponse<{error: string} | {companies: CompanyDTO[]}>> {
	try {
		const benchmarkId = parseInt(params.id);

		if (isNaN(benchmarkId)) {
			return NextResponse.json({error: 'Invalid benchmark ID'}, {status: 400});
		}

		const {companies} = (await request.json()) as {companies: (UpdateCompanyDTO | CreateCompanyDTO)[]};

		if (!Array.isArray(companies) || companies.length === 0) {
			return NextResponse.json({error: 'No companies provided'}, {status: 400});
		}

		const savedCompanies = await companyService.saveCompanies(benchmarkId, companies);
		return NextResponse.json({companies: savedCompanies as CompanyDTO[]}, {status: 201});
	} catch (error) {
		console.error('Error processing companies:', error);
		return NextResponse.json(
			{error: error instanceof Error ? error.message : 'Failed to process companies'},
			{status: 500},
		);
	}
}
