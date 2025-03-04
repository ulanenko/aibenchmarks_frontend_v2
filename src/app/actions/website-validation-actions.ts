'use server';

import {DTO_ValidateAndFindWebsiteRequest, DTO_ValidateAndFindWebsiteResponse} from '@/services/support-services/types';
import * as supportServices from '@/services/support-services';
import {saveCompanies} from '@/services/server/company-service.server';
import {createInputSettings} from '@/lib/company/website-validation';

export interface ValidateWebsiteDTO {
	benchmarkId: number;
	companyId: number;
	companyName: string;
	country: string;
	databaseUrl: string | null;
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
			company_name: dto.companyName,
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
			const inputSettings = createInputSettings(dto.companyName, dto.country, dto.databaseUrl);

			// save the response to the database
			await saveCompanies(dto.benchmarkId, [
				{
					id: dto.companyId,
					// We don't update the URL, keep it as it was in the source
					urlValidationInput: inputSettings,
					urlValidationValid: response.validation_passed,
					urlValidationUrl: response.official_url,
				},
			]);
		}

		return {result: response, error: null};
	} catch (error) {
		console.error(`Error validating website for company ${dto.companyName}:`, error);
		return {
			result: null,
			error: error instanceof Error ? error.message : 'Failed to validate website',
		};
	}
}
