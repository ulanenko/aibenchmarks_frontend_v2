import {getValueForPath, setValueForPath} from '@/lib/object-utils';
import {Company, CompanyHotCopy} from './company';
import {companyCategorizer} from './categorizer';
import {CategoryValue} from '@/types/category';
import {companyColumns} from './company-columns';
import {CATEGORIES} from '@/config/categories';
// Legacy function for backward compatibility
export const updateCategories = (company: Company) => {
	// @ts-ignore
	company.categoryValues = {};

	// step 1 - Source status (website and description validation)
	companyColumns.descriptionStatus.categorize(company);
	companyColumns.websiteStatus.categorize(company);
	// step 2 - Input status
	companyColumns.inputStatus.categorize(company);
	// step 3 - Web search status
	companyColumns.websearchStatus.categorize(company);
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

export const isCompleted = (status: string) => {
	return status && status.toLowerCase() === 'completed';
};

export const isUnsuccessful = (status: string) => {
	return status && status.toLowerCase().search('analysis unsuccessful') !== -1;
};

export const isError = (status: string) => {
	return status && status.toLowerCase().search('error') !== -1;
};
