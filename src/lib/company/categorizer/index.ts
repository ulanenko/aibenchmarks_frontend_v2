import {CategoryValue} from '@/types/category';
import {InputLabelsDescriptions} from './inputCategorizer';
import {Company} from '../company';

const labelerByStep = {
	input: InputLabelsDescriptions,
};

/**
 * @param company - The company to label
 * @param step - The step to label
 * @returns The category value
 */
function companyCategorizer(company: Company, step: keyof typeof labelerByStep): CategoryValue {
	const categories = labelerByStep[step];
	if (!categories) {
		throw new Error(`Invalid step: ${step}`);
	}
	let index = 0;
	let category: CategoryValue | false = false;

	while (!category) {
		category = categories[index](company);
		if (category) {
			return category;
		}
		index++;
		if (index >= categories.length) {
			throw new Error(`No category found for step: ${step}`);
		}
	}
	if (!category) {
		throw new Error(`No category found for step: ${step}`);
	}
	return category;
}

export {companyCategorizer};
