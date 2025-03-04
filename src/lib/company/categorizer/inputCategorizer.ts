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
		const sourceStatus = company.categoryValues.source;
		const sourceCategory = sourceStatus.category;
		// if sourceStatus is not valid, return false
		if (
			sourceCategory.status === 'decision' ||
			sourceCategory.status === 'not_started' ||
			sourceCategory.status === 'in_progress'
		) {
			return sourceStatus;
		}
		if (sourceCategory.status === 'completed') {
			return {
				category: CATEGORIES.INPUT.COMPLETED,
				categoryKey: CATEGORIES.INPUT.COMPLETED.categoryKey,
				label: CATEGORIES.INPUT.COMPLETED.label,
				description: CATEGORIES.INPUT.COMPLETED.tooltipText,
			};
		} else {
			return CATEGORIES.INPUT.READY.toCategoryValue();
		}

		return false;
	},
];

export {InputLabelsDescriptions};
