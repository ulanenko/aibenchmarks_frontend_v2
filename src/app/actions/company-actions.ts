'use server';

import {CompanyDTO, CreateCompanyDTO, UpdateCompanyDTO} from '@/lib/company/type';
import {revalidatePath} from 'next/cache';
import * as companyService from '@/services/server/company-service.server';

/**
 * Server action to get companies for a benchmark
 */
export async function getCompanies(benchmarkId: number): Promise<{
	companies: CompanyDTO[];
	error: string | null;
}> {
	try {
		const companies = await companyService.getCompanies(benchmarkId);
		return {companies, error: null};
	} catch (error) {
		console.error(`Error getting companies for benchmark ${benchmarkId}:`, error);
		return {
			companies: [],
			error: error instanceof Error ? error.message : 'Failed to get companies',
		};
	}
}

/**
 * Server action to save companies for a benchmark
 */
export async function saveCompanies(
	benchmarkId: number,
	companies: (CreateCompanyDTO | UpdateCompanyDTO)[],
	options?: {replace?: boolean},
): Promise<{
	companies: CompanyDTO[];
	error: string | null;
}> {
	try {
		const savedCompanies = await companyService.saveCompanies(benchmarkId, companies, options);

		revalidatePath(`/benchmarks/${benchmarkId}`);
		revalidatePath(`/benchmarks/${benchmarkId}/companies`);

		return {companies: savedCompanies, error: null};
	} catch (error) {
		console.error(`Error saving companies for benchmark ${benchmarkId}:`, error);
		return {
			companies: [],
			error: error instanceof Error ? error.message : 'Failed to save companies',
		};
	}
}
