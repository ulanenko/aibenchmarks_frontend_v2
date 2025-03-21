'use server';

import {db} from '@/db';
import {company} from '@/db/schema';
import {eq, inArray, and} from 'drizzle-orm';
import {CompanyDTO, CreateCompanyDTO, UpdateCompanyDTO} from '@/lib/company/type';
import {SQL} from 'drizzle-orm';

export async function getCompanies(benchmarkId: number): Promise<CompanyDTO[]> {
	try {
		const companiesFromDb = await db.query.company.findMany({
			where: eq(company.benchmarkId, benchmarkId),
		});

		// Convert database results to match CompanyDTO type
		const companies: CompanyDTO[] = companiesFromDb.map((item) => ({
			...item,
			// Ensure non-nullable fields in CompanyDTO have default values if null
			name: item.name || '',
		}));

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

		const savedCompanies: any[] = [];

		// Separate companies into those to create and those to update
		const companiesToCreate: CreateCompanyDTO[] = [];
		const companiesToUpdate: UpdateCompanyDTO[] = [];

		for (const companyData of companies) {
			if ('id' in companyData && companyData.id > 0) {
				companiesToUpdate.push(companyData as UpdateCompanyDTO);
			} else {
				// For companies with temporary IDs (negative), remove the ID property
				// to let the database generate a new ID
				if ('id' in companyData && companyData.id < 0) {
					const {id, ...dataWithoutId} = companyData;
					companiesToCreate.push(dataWithoutId as CreateCompanyDTO);
				} else {
					companiesToCreate.push(companyData as CreateCompanyDTO);
				}
			}
		}

		// Bulk insert new companies if any
		if (companiesToCreate.length > 0) {
			const created = await db
				.insert(company)
				.values(
					companiesToCreate.map((data) => ({
						...data,
						benchmarkId,
					})),
				)
				.returning();

			savedCompanies.push(...created);
		}

		// Process updates efficiently
		if (companiesToUpdate.length > 0) {
			// Group companies by identical field values for bulk updates
			const updateGroups = new Map<string, Map<string, UpdateCompanyDTO[]>>();

			for (const updateData of companiesToUpdate) {
				// Create a key based on the fields being updated (excluding id)
				const {id, ...updateFields} = updateData;
				const fieldsKey = Object.keys(updateFields).sort().join(',');

				if (!updateGroups.has(fieldsKey)) {
					updateGroups.set(fieldsKey, new Map());
				}

				// Create a value key based on the actual values of the fields
				const valueKey = Object.keys(updateFields)
					.sort()
					.map((key) => `${key}:${JSON.stringify(updateData[key as keyof typeof updateData])}`)
					.join('|');

				const fieldGroup = updateGroups.get(fieldsKey)!;
				if (!fieldGroup.has(valueKey)) {
					fieldGroup.set(valueKey, []);
				}

				fieldGroup.get(valueKey)!.push(updateData);
			}

			// Process each group of updates
			for (const [_, fieldGroups] of updateGroups.entries()) {
				for (const [_, sameValueUpdates] of fieldGroups.entries()) {
					// Process in batches to avoid excessive SQL statement size
					const batchSize = 100; // Adjust based on your database capabilities

					for (let i = 0; i < sameValueUpdates.length; i += batchSize) {
						const batch = sameValueUpdates.slice(i, i + batchSize);
						const companyIds = batch.map((item) => item.id);

						if (batch.length > 0) {
							// Extract update fields from the first item (they all have the same values)
							const {id, ...updateFields} = batch[0];

							// Add benchmarkId and updatedAt
							const fieldsToUpdate = {
								...updateFields,
								updatedAt: new Date(),
							};

							// Perform bulk update for companies with the same field values
							const updated = await db
								.update(company)
								.set(fieldsToUpdate)
								.where(and(eq(company.benchmarkId, benchmarkId), inArray(company.id, companyIds)))
								.returning();

							savedCompanies.push(...updated);
						}
					}
				}
			}

			// For any companies that weren't updated (due to no changes or other issues),
			// fetch their current state to include in the response
			const updatedIds = new Set(savedCompanies.map((item) => item.id));
			const missingIds = companiesToUpdate.map((item) => item.id).filter((id) => !updatedIds.has(id));

			if (missingIds.length > 0) {
				const missingCompanies = await db.query.company.findMany({
					where: and(eq(company.benchmarkId, benchmarkId), inArray(company.id, missingIds)),
				});

				savedCompanies.push(...missingCompanies);
			}
		}

		// Convert the database results to the expected DTO format
		const typedResults: CompanyDTO[] = savedCompanies.map((item) => ({
			...item,
			// Ensure non-nullable fields in CompanyDTO have default values if null
			name: item.name || '',
		}));

		return typedResults;
	} catch (error) {
		console.error(`Error saving companies for benchmark ${benchmarkId}:`, error);
		throw error;
	}
}

/**
 * Updates companies with their search IDs after starting an analysis
 *
 * @param searchIdMap - Map of company IDs to search IDs
 * @returns The updated company data
 */
export async function updateCompanySearchIds(searchIdMap: Record<number, string>): Promise<CompanyDTO[]> {
	try {
		const companyIds = Object.keys(searchIdMap).map((id) => parseInt(id));

		if (companyIds.length === 0) {
			return [];
		}

		const updatedCompanies: CompanyDTO[] = [];

		// Process all the updates at once by combining SQL operations
		for (const companyId of companyIds) {
			const searchId = searchIdMap[companyId];

			// Skip if we don't have a search ID for some reason
			if (!searchId) continue;

			// Update the company with its search ID
			const updated = await db
				.update(company)
				.set({
					searchId: searchId,
					updatedAt: new Date(),
				})
				.where(eq(company.id, companyId))
				.returning();

			if (updated.length > 0) {
				updatedCompanies.push({
					...updated[0],
					// Ensure non-nullable fields have default values
					name: updated[0].name || '',
				});
			}
		}

		return updatedCompanies;
	} catch (error) {
		console.error('Error updating company search IDs:', error);
		throw error;
	}
}
