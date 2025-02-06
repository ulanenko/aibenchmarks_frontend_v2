'use server';

import {db} from '@/db';
import {company, StepStatus} from '@/db/schema';
import {eq, and, inArray} from 'drizzle-orm';
import type {UpdateCompanyDTO} from '@/lib/company';

// Use the actual database types from schema
type DBCompany = typeof company.$inferSelect;
type DBCompanyInsert = typeof company.$inferInsert;

function sanitizeCompanyData(data: Partial<UpdateCompanyDTO>): Partial<DBCompanyInsert> {
	const {id, createdAt, updatedAt, ...rest} = data;
	const sanitized: Partial<DBCompanyInsert> = {...rest};

	// Ensure dataStatus is a valid enum value if present
	if (rest.dataStatus) {
		if (['pending', 'in_progress', 'completed', 'failed'].includes(rest.dataStatus)) {
			sanitized.dataStatus = rest.dataStatus as StepStatus;
		} else {
			delete sanitized.dataStatus;
		}
	}

	return sanitized;
}

export async function saveCompanies(benchmarkId: number, companies: UpdateCompanyDTO[]) {
	// Separate new companies from updates
	const [newCompanies, existingCompanies] = companies.reduce<[DBCompanyInsert[], UpdateCompanyDTO[]]>(
		(acc, company) => {
			if (company.id < 0) {
				// Remove temp ID and add to new companies
				const sanitizedData = sanitizeCompanyData(company);
				acc[0].push({
					...sanitizedData,
					benchmarkId,
					name: company.name ?? null,
				} as DBCompanyInsert);
			} else {
				acc[1].push(company);
			}
			return acc;
		},
		[[], []],
	);

	// Use a single transaction for all operations
	return await db.transaction(async (tx) => {
		const savedCompanies: DBCompany[] = [];

		// Batch insert new companies if any
		if (newCompanies.length > 0) {
			const insertedCompanies = await tx.insert(company).values(newCompanies).returning();
			savedCompanies.push(...insertedCompanies);
		}

		// Update existing companies in batches
		if (existingCompanies.length > 0) {
			// Create update promises for each company
			const updatePromises = existingCompanies.map((companyUpdate) => {
				const {id} = companyUpdate;
				const sanitizedData = sanitizeCompanyData(companyUpdate);

				// Only update if there are fields to update
				if (Object.keys(sanitizedData).length > 0) {
					return tx
						.update(company)
						.set({
							...sanitizedData,
							updatedAt: new Date(),
						})
						.where(and(eq(company.id, id), eq(company.benchmarkId, benchmarkId)))
						.returning();
				}
				return Promise.resolve([]);
			});

			// Execute all updates in parallel within the transaction
			const updatedCompaniesArrays = await Promise.all(updatePromises);
			updatedCompaniesArrays.forEach((companies) => {
				if (companies.length > 0) {
					savedCompanies.push(companies[0]);
				}
			});
		}

		return savedCompanies;
	});
}
