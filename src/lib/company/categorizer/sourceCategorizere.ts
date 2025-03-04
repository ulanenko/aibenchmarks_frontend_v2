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
export const SourceCategorizer: Categorizer = [
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
			return CATEGORIES.SOURCE.NOT_VALIDATED.toCategoryValue();
		}

		if (company.websiteValidation?.is_validating) {
			return CATEGORIES.SOURCE.VALIDATING.toCategoryValue();
		}

		const websiteIsValid = company.websiteValidation!.url_validated_and_accessible;
		const descriptionIsValid = isValidDescription(company);

		if (websiteIsValid && descriptionIsValid) {
			return CATEGORIES.SOURCE.VALID_WEBSITE_AND_DESCRIPTION.toCategoryValue();
		}

		if (websiteIsValid && !descriptionIsValid) {
			return CATEGORIES.SOURCE.VALID_WEBSITE.toCategoryValue();
		}

		if (!websiteIsValid && descriptionIsValid) {
			return CATEGORIES.SOURCE.VALID_DESCRIPTION.toCategoryValue();
		}

		if (!websiteIsValid && !descriptionIsValid) {
			return CATEGORIES.SOURCE.REJECT_NO_SOURCE.toCategoryValue();
		}

		return false;
	},
];
