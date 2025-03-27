// Export the AI mapper service
export {aiMapper} from './ai-mapper/ai-mapper';
export {validateAndFindWebsite, validateAndFindWebsiteBatch} from './website-validation/website-validator';

// Export types
export type {
	DTO_ValidateAndFindWebsiteRequest,
	DTO_ValidateAndFindWebsiteResponse,
	DTO_ValidateAndFindWebsiteRequestBatch,
	DTO_ValidateAndFindWebsiteResponseBatch,
} from './website-validation/types';

export type {
	MapperInput,
	SourceColumn,
	TargetOption,
	AIMapperResults,
	AIMapperResultItem,
} from './ai-mapper/types';