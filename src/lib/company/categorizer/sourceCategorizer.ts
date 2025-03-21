import {CATEGORIES} from '@/config/categories';
import {Company, CompanyHotCopy} from '@/lib/company/company';
import {Categorizer, CategoryValue} from '@/types/category';
import {getValidationStatus, isValidationUpToDate} from '../website-validation';
import {CategoryDefinition} from '@/lib/category-definition';
import {VALIDATION} from '@/config/validation';

/**
 * Helper function to check if a description is valid (meets the minimum word count requirement)
 */
function isValidDescription(company: Company): boolean {
	const descriptions = [
		company.inputValues.fullOverviewManual,
		company.inputValues.tradeDescriptionEnglish,
		company.inputValues.fullOverview,
	];

	// Check if any description meets the minimum word count requirement
	return descriptions.some((description) => {
		if (!description) return false;
		const wordCount = description.trim().split(/\s+/).length;
		return wordCount >= VALIDATION.COMPANY_DESCRIPTION_MIN_WORDS;
	});
}

/**
 * Categorizer for source validation status (website and description)
 */
export const WebsiteCategorizer: Categorizer = [
	// Not validated yet
	(company) => {
		// If no website validation data or inputs have changed since validation
		const webisteIsValidated =
			company.websiteValidation &&
			isValidationUpToDate(
				company.websiteValidation,
				company.inputValues.name,
				company.inputValues.country || '',
				company.inputValues.url,
			);

		if (webisteIsValidated !== true) {
			// check if company has sufficient data
			const inputProvided = company.requiredInputProvided();
			if (inputProvided !== true) {
				return CATEGORIES.WEBSITE.NOT_READY.toCategoryValue();
			} else {
				return CATEGORIES.WEBSITE.NOT_VALIDATED.toCategoryValue();
			}
		}

		if (company.websiteValidation?.is_validating) {
			return CATEGORIES.WEBSITE.VALIDATING.toCategoryValue();
		}

		const websiteIsValid = company.websiteValidation!.url_validated_and_accessible;

		if (websiteIsValid) {
			return CATEGORIES.WEBSITE.VALID.toCategoryValue();
		}

		if (!websiteIsValid) {
			return CATEGORIES.WEBSITE.INVALID.toCategoryValue();
		}
		return false;
	},
];

export const DescriptionCategorizer: Categorizer = [
	(company) => {
		const descriptionIsValid = isValidDescription(company);
		return descriptionIsValid
			? CATEGORIES.DESCRIPTION.VALID.toCategoryValue()
			: CATEGORIES.DESCRIPTION.INVALID.toCategoryValue();
	},
];

/**
 * Categorizer for web search status
 */
export const WebSearchCategorizer: Categorizer = [
	(company) => {
		// If web search is initialized but no search ID, show as "Frontend initialized"
		if (company.frontendState?.webSearchInitialized && !company.backendState?.searchId) {
			return CATEGORIES.WEBSEARCH.FRONTEND_INITIALIZED.toCategoryValue();
		}

		// If we have a search ID, show as "In queue"
		if (company.backendState?.searchId) {
			return CATEGORIES.WEBSEARCH.IN_QUEUE.toCategoryValue();
		}

		// If no search initiated, check if the INPUT category is completed
		const inputStatus = company.categoryValues?.INPUT;
		if (inputStatus && inputStatus.category.status === 'completed') {
			return CATEGORIES.WEBSEARCH.READY.toCategoryValue();
		}

		return CATEGORIES.WEBSEARCH.NOT_READY.toCategoryValue();
	},
];
