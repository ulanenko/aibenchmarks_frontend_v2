import {CATEGORIES} from '@/config/categories';
import {Company, CompanyHotCopy} from '@/lib/company/company';
import {Categorizer, CategoryValue} from '@/types/category';
import {getValidationStatus, isValidationUpToDate} from '../website-validation';
import {CategoryDefinition} from '@/lib/category-definition';
import {VALIDATION} from '@/config/validation';
import {isCompleted, isError, isInProgress, isUnsuccessful} from '../utils';

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



export const DescriptionCategorizer: Categorizer = [
	(company) => {
		const descriptionIsValid = isValidDescription(company);
		return descriptionIsValid
			? CATEGORIES.DESCRIPTION.VALID.toCategoryValue()
			: CATEGORIES.DESCRIPTION.INVALID.toCategoryValue();
	},
];


/**
 * Categorizer for source validation status (website and description)
 */
export const WebsiteCategorizer: Categorizer = [
	// Not validated yet
	(company) => {
		// If no website validation data or inputs have changed since validation

		if (!isValidationUpToDate(company)) {
			// check if company has sufficient data
			const inputProvided = company.requiredInputProvided();
			if (inputProvided !== true) {
				return CATEGORIES.WEBSITE.NOT_READY.toCategoryValue();
			} else {
				return CATEGORIES.WEBSITE.NOT_VALIDATED.toCategoryValue();
			}
		}

		if (company.frontendState?.urlValidationInitialized) {
			return CATEGORIES.WEBSITE.VALIDATING.toCategoryValue();
		}

		const websiteIsValid = company.backendState?.urlValidationValid;

		if (websiteIsValid) {
			return CATEGORIES.WEBSITE.VALID.toCategoryValue();
		}

		if (!websiteIsValid) {
			return CATEGORIES.WEBSITE.INVALID.toCategoryValue();
		}
		return false;
	},
];

/**
 * Categorizer for site match results
 */
export const SiteMatchCategorizer: Categorizer = [
	(company) => {
		const siteMatchResult = company.searchedCompanyData?.site_match?.overall_result;
		
		if (!siteMatchResult) {
			return CATEGORIES.SITE_MATCH.NOT_AVAILABLE.toCategoryValue();
		}

		switch (siteMatchResult) {
			case 'Likely':
				return CATEGORIES.SITE_MATCH.LIKELY.toCategoryValue();
			case 'Possibly':
				return CATEGORIES.SITE_MATCH.POSSIBLY.toCategoryValue();
			case 'Not Likely':
				return CATEGORIES.SITE_MATCH.NOT_LIKELY.toCategoryValue();
			case 'Uncertain':
				return CATEGORIES.SITE_MATCH.UNCERTAIN.toCategoryValue();
			default:
				return CATEGORIES.SITE_MATCH.NOT_AVAILABLE.toCategoryValue();
		}
	},
];
