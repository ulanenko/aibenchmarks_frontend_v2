import {StepType} from '@/types/stepType';
import {getValueForPath, setValueForPath} from '@/lib/object-utils';
import {Company} from './company';

const statusToValue = {
	completed: 'Completed',
	failed: 'Failed',
};

/**
 * Validates a company's required fields and updates its validation status.
 * @param company - The company object to validate
 * @returns An array of validation error messages
 */
export const validateCompany = (company: Company): string[] => {
	const errors: string[] = [];
	if (!company.name?.trim()) {
		errors.push('Company name is required');
	}
	if (!company.country?.trim()) {
		errors.push('Country is required');
	}
	const status = errors.length === 0 ? 'completed' : 'failed';
	const statusValue: StepType = {
		description: errors.length === 0 ? 'Completed' : errors.join(', '),
		errors: errors,
		value: statusToValue[status],
		status,
	};
	setValueForPath(company, 'step.input', statusValue);
	return errors;
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
