import {Categorizer, CategoryValue} from '@/types/category';
import {InputLabelsDescriptions} from './inputCategorizer';
import {Company} from '../company';
import {CategoryType} from '@/config/categories';

/**
 * @param company - The company to label
 * @param step - The step to label
 * @returns The category value
 */
function companyCategorizer(company: Company, categorizer: Categorizer): CategoryValue {
	let index = 0;
	let category: CategoryValue | false = false;

	while (!category) {
		category = categorizer[index](company);
		if (category) {
			return category;
		}
		index++;
		if (index >= categorizer.length) {
			throw new Error(`No category found`);
		}
	}
	return category;
}

export {companyCategorizer};
