import {getValueForPath, setValueForPath} from '@/lib/object-utils';
import {Company} from './company';
import {companyCategorizer} from './categorizer';
import {CategoryValue} from '@/types/category';
import {companyColumns} from './company-columns';
// Legacy function for backward compatibility
export const updateCategories = (company: Company) => {
	// step 1 - Source status (website and description validation)
	companyColumns.sourceStatus.categorize(company);
	// step 2 - Input status
	companyColumns.inputStatus.categorize(company);
};

export const getObjectsByCategory = (objects: {[key: string]: any}[], dataPath: string): {[key: string]: any[]} => {
	return objects.reduce((acc: {[key: string]: any[]}, object) => {
		const value = getValueForPath(object, dataPath);
		if (value) {
			acc[value] = acc[value] || []; // Initialize array if doesn't exist
			acc[value].push(object);
		}
		return acc;
	}, {});
};

export const getUniqueValuesForPath = (objects: {[key: string]: any}[], dataPath: string) => {
	const valuesSet = objects.reduce<Set<string>>((acc, object) => {
		const value = getValueForPath(object, dataPath);
		if (value) {
			acc.add(value.toString());
		}
		return acc;
	}, new Set<string>());
	return Array.from(valuesSet);
};
