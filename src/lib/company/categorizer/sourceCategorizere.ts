import {CATEGORIES} from '@/config/categories';
import {Company} from '@/lib/company/company';
import {Categorizer, CategoryValue} from '@/types/category';
import {getValidationStatus, isValidationUpToDate} from '../website-validation';
import {CategoryDefinition} from '@/lib/category-definition';

/**
 * Helper function to check if a description is valid (more than 100 words)
 */
function isValidDescription(company: Company): boolean {
	const descriptions = [
		company.inputValues.fullOverviewManual,
		company.inputValues.tradeDescriptionEnglish,
		company.inputValues.fullOverview,
	];

	// Check if any description has more than 100 words
	return descriptions.some((description) => {
		if (!description) return false;
		const wordCount = description.trim().split(/\s+/).length;
		return wordCount > 100;
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
