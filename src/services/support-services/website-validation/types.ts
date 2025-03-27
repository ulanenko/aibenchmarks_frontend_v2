// Website validation DTOs
export interface DTO_ValidateAndFindWebsiteRequest {
	company_name: string;
	country: string;
	database_url?: string;
}

export interface DTO_ValidateAndFindWebsiteResponse {
	validation_passed: boolean;
	official_url: string;
	replaced: boolean;
	finetuned: boolean;
}

// Batch website validation DTOs - simplified to be direct arrays
export type DTO_ValidateAndFindWebsiteRequestBatch = DTO_ValidateAndFindWebsiteRequest[];
export type DTO_ValidateAndFindWebsiteResponseBatch = DTO_ValidateAndFindWebsiteResponse[];
