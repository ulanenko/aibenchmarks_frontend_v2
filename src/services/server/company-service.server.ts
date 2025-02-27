'use server';

import {db} from '@/db';
import {company, StepStatus} from '@/db/schema';
import {eq, and, inArray, sql} from 'drizzle-orm';
import type {CompanyDBType, UpdateCompanyDTO, CreateCompanyDTO} from '@/lib/company/type';

type CompanyInsert = Omit<CompanyDBType, 'id' | 'createdAt' | 'updatedAt'>;

function sanitizeCompanyData(data: UpdateCompanyDTO | CreateCompanyDTO): CompanyInsert {
	const {id, createdAt, updatedAt, dataStatus, ...rest} = data as any;
	const sanitized: Partial<CompanyInsert> = {
		...rest,
	};

	return sanitized as CompanyInsert;
}

export async function saveCompanies(
	benchmarkId: number,
	companies: (UpdateCompanyDTO | CreateCompanyDTO)[],
): Promise<CompanyDBType[]> {
	// Separate new companies from updates
	const [newCompanies, existingCompanies] = companies.reduce<[CompanyInsert[], UpdateCompanyDTO[]]>(
		(acc, company) => {
			if (!('id' in company) || company.id < 0) {
				// Remove temp ID and add to new companies
				const sanitizedData = sanitizeCompanyData(company);
				acc[0].push({
					...sanitizedData,
					benchmarkId,
					name: company.name ?? null,
				});
			} else {
				acc[1].push(company);
			}
			return acc;
		},
		[[], []],
	);

	// Use a single transaction for all operations
	return await db.transaction(async (tx) => {
		const savedCompanies: CompanyDBType[] = [];

		// Batch insert new companies if any
		if (newCompanies.length > 0) {
			const insertedCompanies = await tx.insert(company).values(newCompanies).returning();
			savedCompanies.push(...insertedCompanies);
		}

		// Batch update existing companies
		if (existingCompanies.length > 0) {
			// Group companies by their update fields to batch similar updates
			const updateGroups = new Map<string, UpdateCompanyDTO[]>();

			existingCompanies.forEach((companyUpdate) => {
				const sanitizedData = sanitizeCompanyData(companyUpdate);
				if (Object.keys(sanitizedData).length > 0) {
					// Create a key based on the fields being updated
					const updateKey = Object.keys(sanitizedData).sort().join(',');
					if (!updateGroups.has(updateKey)) {
						updateGroups.set(updateKey, []);
					}
					updateGroups.get(updateKey)!.push(companyUpdate);
				}
			});

			// Process each update group in a batch
			for (const [_, groupCompanies] of updateGroups) {
				const ids = groupCompanies.map((c) => c.id);
				const sanitizedData = sanitizeCompanyData(groupCompanies[0]); // All companies in group have same fields to update

				const updatedCompanies = await tx
					.update(company)
					.set({
						...sanitizedData,
						updatedAt: new Date(),
					})
					.where(and(inArray(company.id, ids), eq(company.benchmarkId, benchmarkId)))
					.returning();

				savedCompanies.push(...updatedCompanies);
			}
		}

		return savedCompanies;
	});
}

export async function getCompaniesByBenchmarkId(benchmarkId: number): Promise<CompanyDBType[]> {
	return await db.select().from(company).where(eq(company.benchmarkId, benchmarkId));
}
