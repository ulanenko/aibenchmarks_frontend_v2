import {getValueForPath, setValueForPath} from '@/lib/object-utils';
import {Company} from './company';
import {companyCategorizer} from './categorizer';
import {CategoryValue} from '@/types/category';
// Legacy function for backward compatibility
// Legacy function for backward compatibility
export const validateCompany = (company: Company): CategoryValue[] => {
	// step 1
	const stepName = 'input';
	const step1 = companyCategorizer(company, stepName);
	company.step[stepName] = step1;
	// step 2

	return [step1];
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
