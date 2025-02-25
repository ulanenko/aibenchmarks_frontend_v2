import {CATEGORIES} from '@/config/categories';
import {Company} from '@/lib/company/company';
import {checkIfValidUrl} from '@/lib/utils';
import {CategoryValue} from '@/types/category';

const InputLabelsDescriptions: ((company: Company) => CategoryValue | false)[] = [
	(company) => {
		if (company.isEmpty()) {
			return {
				category: CATEGORIES.INPUT.NEW,
				categoryKey: 'CATEGORIES.INPUT.NEW',
				label: 'Empty',
				description: 'No data',
			};
		}
		return false;
	},
	(company) => {
		const completed = company.isCompleted();
		if (completed !== true) {
			return {
				category: CATEGORIES.INPUT.INPUT_REQUIRED,
				categoryKey: 'CATEGORIES.INPUT.INPUT_REQUIRED',
				label: completed,
				description: CATEGORIES.INPUT.INPUT_REQUIRED.tooltipText,
			};
		}
		return false;
	},
	(company) => {
		const validUrl = checkIfValidUrl(company.url);
		if (!validUrl) {
			return {
				category: CATEGORIES.INPUT.WEBSITE_INVALID,
				categoryKey: 'CATEGORIES.INPUT.WEBSITE_INVALID',
				label: 'Invalid URL',
				description: 'Invalid website URL',
			};
		}
		return false;
	},
	(company) => {
		if (company.isCompleted()) {
			return {
				category: CATEGORIES.INPUT.COMPLETED,
				categoryKey: 'CATEGORIES.INPUT.COMPLETED',
				label: CATEGORIES.INPUT.COMPLETED.label,
				description: CATEGORIES.INPUT.COMPLETED.tooltipText,
			};
		}
		return false;
	},
];

export {InputLabelsDescriptions};
