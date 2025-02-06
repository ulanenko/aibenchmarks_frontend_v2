'use server';

import {NextResponse, NextRequest} from 'next/server';
import {db} from '@/db';
import {company} from '@/db/schema';
import {eq} from 'drizzle-orm';
import type {UpdateCompanyDTO} from '@/lib/company';
import * as companyService from '@/services/server/company-service.server';

export async function GET(request: Request, {params}: {params: {id: string}}) {
	try {
		const loadedParams = await params;
		const benchmarkId = parseInt(loadedParams.id);
		const companies = await db.select().from(company).where(eq(company.benchmarkId, benchmarkId));
		return NextResponse.json({companies});
	} catch (error) {
		console.error('Error fetching companies:', error);
		return NextResponse.json({error: 'Failed to fetch companies'}, {status: 500});
	}
}

export async function POST(request: NextRequest, context: {params: Promise<{id: string}>}) {
	try {
		const {companies} = (await request.json()) as {companies: UpdateCompanyDTO[]};
		const params = await context.params;
		const benchmarkId = parseInt(params.id);

		if (!Array.isArray(companies) || companies.length === 0) {
			return NextResponse.json({error: 'No companies provided'}, {status: 400});
		}

		const savedCompanies = await companyService.saveCompanies(benchmarkId, companies);
		return NextResponse.json({companies: savedCompanies}, {status: 201});
	} catch (error) {
		console.error('Error processing companies:', error);
		return NextResponse.json(
			{error: error instanceof Error ? error.message : 'Failed to process companies'},
			{status: 500},
		);
	}
}
