// Export the AI mapper service
export {aiMapper} from './ai-mapper';
export {validateAndFindWebsite, validateAndFindWebsiteBatch} from './website-validator';

// Export types
export type {
	MapperInput,
	SourceColumn,
	TargetOption,
	AIMapperResults,
	AIMapperResultItem,
	DTO_ValidateAndFindWebsiteRequest,
	DTO_ValidateAndFindWebsiteResponse,
	DTO_ValidateAndFindWebsiteRequestBatch,
	DTO_ValidateAndFindWebsiteResponseBatch,
} from './types';
