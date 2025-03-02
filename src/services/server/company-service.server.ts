'use server';

import {db} from '@/db';
import {company} from '@/db/schema';
import {eq} from 'drizzle-orm';
import {CompanyDTO, CreateCompanyDTO, UpdateCompanyDTO} from '@/lib/company/type';

export async function getCompanies(benchmarkId: number): Promise<CompanyDTO[]> {
	try {
		const companies = await db.query.company.findMany({
			where: eq(company.benchmarkId, benchmarkId),
		});

		return companies;
	} catch (error) {
		console.error(`Error getting companies for benchmark ${benchmarkId}:`, error);
		throw error;
	}
}

export async function saveCompanies(
	benchmarkId: number,
	companies: (CreateCompanyDTO | UpdateCompanyDTO)[],
	options?: {replace?: boolean},
): Promise<CompanyDTO[]> {
	try {
		// If replace option is true, delete all existing companies for this benchmark
		if (options?.replace) {
			await db.delete(company).where(eq(company.benchmarkId, benchmarkId));
		}

		const savedCompanies: CompanyDTO[] = [];

		// Process each company
		for (const companyData of companies) {
			if ('id' in companyData && companyData.id > 0) {
				// Update existing company
				const [updated] = await db
					.update(company)
					.set({
						...companyData,
						benchmarkId,
						updatedAt: new Date(),
					})
					.where(eq(company.id, companyData.id))
					.returning();

				if (updated) {
					savedCompanies.push(updated);
				}
			} else {
				// Create new company
				const [created] = await db
					.insert(company)
					.values({
						...companyData,
						benchmarkId,
					})
					.returning();

				if (created) {
					savedCompanies.push(created);
				}
			}
		}

		return savedCompanies;
	} catch (error) {
		console.error(`Error saving companies for benchmark ${benchmarkId}:`, error);
		throw error;
	}
}
