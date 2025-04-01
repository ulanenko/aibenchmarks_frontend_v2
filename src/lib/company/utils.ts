import {getValueForPath, setValueForPath} from '@/lib/object-utils';
import {Company, CompanyHotCopy} from './company';
import {companyCategorizer} from './categorizer';
import {CategoryValue} from '@/types/category';
import {companyColumns} from './company-columns';
import {CATEGORIES} from '@/config/categories';
import { checkUrlChanged, isEmpty } from '../utils';
// Legacy function for backward compatibility
export const updateCategories = (company: Company) => {
	// @ts-ignore
	company.categoryValues = {
		INPUT: undefined,
		DESCRIPTION: undefined,
		WEBSITE: undefined,
		WEBSEARCH: undefined,
		ACCEPT_REJECT: undefined,
		REVIEW_PRIORITY: undefined,
		HUMAN_REVIEW: undefined,
	} as any;

	// step 1 - Source status (website and description validation)
	companyColumns.descriptionStatus.categorize(company);
	companyColumns.websiteStatus.categorize(company);
	// step 2 - Input status
	companyColumns.inputStatus.categorize(company);

	// step 3 - Site match status
	companyColumns.siteMatchStatus.categorize(company);

	// step 4 - Web search status
	companyColumns.websearchStatus.categorize(company);

	// step 4 - Accept/reject status
	companyColumns.acceptRejectStatus.categorize(company);

	// step 5 - Human review status
	companyColumns.humanReviewStatus.categorize(company);

	// step 6 - Decision status
	companyColumns.decisionStatus.categorize(company);
};

export const updateDynamicInputValues = (company: Company) => {
	company.dynamicInputValues = {
		url: company.inputValues?.url,
		urlValidationStatus: 'input',
	}
	updateWebsiteValidationStatus(company)
}

/**
 * this is called to check if the website validation status is updated
 * @param company 
 */
const updateWebsiteValidationStatus = (company: Company) => {
	let urlValidationStatus: 'input' | 'updated' | 'fine-tuned' | 'correct' | 'invalid' = 'input';
	const websiteIsValid = company.categoryValues?.WEBSITE.category.passed === true;
	const websiteIsValidated = company.categoryValues?.WEBSITE.category.passed !== undefined;
		if (websiteIsValidated) {
			if (websiteIsValid) {
				if (company.backendState?.urlValidationUrl === company.inputValues?.url) {
					urlValidationStatus = 'correct';
				} else {
					urlValidationStatus = checkUrlChanged(company.backendState?.urlValidationUrl, company.inputValues?.url)
						? 'updated'
						: 'fine-tuned';
				}
			} else {
				urlValidationStatus = 'invalid';
			}
		}

	company.dynamicInputValues = {
		url: websiteIsValid ? company.backendState?.urlValidationUrl : company.inputValues?.url,
		urlValidationStatus,
	};
}

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

type StringOrNull = string | null | undefined;

export const isInQueue = (status: StringOrNull) => {
	return status && status.toLowerCase().search('in queue') !== -1;
};


export const isCompleted = (status: StringOrNull) => {
	return status && status.toLowerCase() === 'completed';
};

export const isUnsuccessful = (status: StringOrNull) => {
	return status && status.toLowerCase().search('analysis unsuccessful') !== -1;
};

export const isError = (status: StringOrNull) => {
	return status && status.toLowerCase().search('error') !== -1;
};

export const isInProgress = (status: StringOrNull) => {
	return status && status.toLowerCase().search('in progress') !== -1;
};


export const isAcceptOrReject = (status: StringOrNull) => {
	if(isEmpty(status)) {
		return undefined;
	}
	const statusLower = `${status}`.toLowerCase();
	if(statusLower.search('accept') !== -1) {
		return true;
	}
	if(statusLower.search('reject') !== -1) {
		return false;
	}
	return undefined;
};

