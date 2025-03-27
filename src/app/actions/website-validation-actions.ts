'use server';

import {
	DTO_ValidateAndFindWebsiteRequest,
	DTO_ValidateAndFindWebsiteResponse,
	DTO_ValidateAndFindWebsiteRequestBatch,
	DTO_ValidateAndFindWebsiteResponseBatch,
} from '@/services/support-services/website-validation/types';
import * as supportServices from '@/services/support-services';
import {saveCompanies} from '@/services/server/company-service.server';
import {createInputSettings} from '@/lib/company/website-validation';

export interface WebsiteValidateDTO {
	id: number;
	name: string;
	country: string;
	databaseUrl: string | null;
}

export interface ValidateWebsiteDTO extends WebsiteValidateDTO {
	benchmarkId: number;
}

/**
 * Interface for batch website validation
 */
export interface ValidateWebsiteBatchDTO {
	benchmarkId: number;
	companies: Array<WebsiteValidateDTO>;
}

/**
 * Server action to validate and find a website for a company
 */
export async function validateAndFindWebsite(dto: ValidateWebsiteDTO): Promise<{
	result: DTO_ValidateAndFindWebsiteResponse | null;
	error: string | null;
}> {
	try {
		const request: DTO_ValidateAndFindWebsiteRequest = {
			company_name: dto.name,
			country: dto.country,
			database_url: dto.databaseUrl || undefined,
		};

		const [response, error] = await supportServices.validateAndFindWebsite(request);

		if (error) {
			return {result: null, error};
		}

		// Make sure response is not null before accessing its properties
		if (response) {
			// Create input settings string
			const inputSettings = createInputSettings(dto.name, dto.country, dto.databaseUrl);

			// save the response to the database
			await saveCompanies(dto.benchmarkId, [
				{
					id: dto.id,
					// We don't update the URL, keep it as it was in the source
					urlValidationInput: inputSettings,
					urlValidationValid: response.validation_passed,
					urlValidationUrl: response.official_url,
				},
			]);
		}

		return {result: response, error: null};
	} catch (error) {
		console.error(`Error validating website for company ${dto.name}:`, error);
		return {
			result: null,
			error: error instanceof Error ? error.message : 'Failed to validate website',
		};
	}
}

/**
 * Server action to validate and find websites for multiple companies
 */
export async function validateAndFindWebsiteBatch(dto: ValidateWebsiteBatchDTO): Promise<{
	results: Array<{
		companyId: number;
		result: DTO_ValidateAndFindWebsiteResponse | null;
	}> | null;
	error: string | null;
}> {
	try {
		// Create the array of validation requests directly
		const requestArray: DTO_ValidateAndFindWebsiteRequestBatch = dto.companies.map((company) => ({
			company_name: company.name,
			country: company.country,
			database_url: company.databaseUrl || undefined,
		}));

		const [response, error] = await supportServices.validateAndFindWebsiteBatch(requestArray);

		if (error) {
			return {results: null, error};
		}

		// Make sure response is not null before accessing its properties
		if (response) {
			// Prepare database updates
			const companyUpdates = dto.companies.map((company, index) => {
				const validationResult = response[index];

				// Create input settings string
				const inputSettings = createInputSettings(company.name, company.country, company.databaseUrl);

				return {
					id: company.id,
					urlValidationInput: inputSettings,
					urlValidationValid: validationResult.validation_passed,
					urlValidationUrl: validationResult.official_url,
				};
			});

			// Save all updates to the database
			await saveCompanies(dto.benchmarkId, companyUpdates);

			// Return the results mapped to company IDs
			const results = dto.companies.map((company, index) => ({
				companyId: company.id,
				result: response[index] || null,
			}));

			return {results, error: null};
		}

		return {results: null, error: 'Invalid response from validation service'};
	} catch (error) {
		console.error(`Error validating websites in batch:`, error);
		return {
			results: null,
			error: error instanceof Error ? error.message : 'Failed to validate websites in batch',
		};
	}
}
