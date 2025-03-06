import {CATEGORIES} from '@/config/categories';
import {Company} from '@/lib/company/company';
import {checkIfValidUrl, isEmpty} from '@/lib/utils';
import {Categorizer} from '@/types/category';

const InputLabelsDescriptions: Categorizer = [
	(company) => {
		if (company.isEmpty()) {
			return {
				category: CATEGORIES.INPUT.NEW,
				categoryKey: CATEGORIES.INPUT.NEW.categoryKey,
				label: 'Empty',
				description: 'No data',
			};
		}
		return false;
	},
	(company) => {
		const completed = company.requiredInputProvided();
		if (completed !== true) {
			return CATEGORIES.INPUT.INPUT_REQUIRED.toCategoryValue({label: completed});
		}
		return false;
	},
	(company) => {
		const urlIsEmpty = isEmpty(company.url) || company.url?.toLowerCase() == 'n/a';
		if (urlIsEmpty) {
			return false;
		}
		const validUrl = checkIfValidUrl(company.url);
		if (validUrl === false) {
			return CATEGORIES.INPUT.WEBSITE_INVALID.toCategoryValue();
		}
		return false;
	},
	(company) => {
		const websiteStatus = company.categoryValues!.WEBSITE;
		const websiteCategory = websiteStatus.category;
		const INPUTCATEGORIES = CATEGORIES.INPUT;
		// if sourceStatus is not valid, return false
		// if sourceStatus is not valid, return false

		// if the webite validation has not been run, the user should run the analysis
		if (!websiteCategory?.isDone()) {
			// chekc if it's in progress
			if (websiteCategory.status === 'in_progress') {
				return INPUTCATEGORIES.IN_PROGRESS.toCategoryValue();
			}
			return INPUTCATEGORIES.READY.toCategoryValue();
		}

		const descriptionStatus = company.categoryValues!.DESCRIPTION;
		const descriptionCategory = descriptionStatus.category;
		// if either the website or the description is valid (if the validation has been run), return the completed category
		if (descriptionCategory.passed || websiteCategory.passed) {
			return INPUTCATEGORIES.COMPLETED.toCategoryValue();
		} else {
			return INPUTCATEGORIES.REJECT_NO_SOURCE.toCategoryValue();
		}
	},
];

export {InputLabelsDescriptions};
