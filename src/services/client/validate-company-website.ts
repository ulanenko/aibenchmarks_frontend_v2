import {validateAndFindWebsite, ValidateWebsiteDTO} from '@/app/actions/website-validation-actions';
import {CompanyHotCopy} from '@/lib/company/company';
import {WebsiteValidationStatus, createInputSettings} from '@/lib/company/website-validation';
import {useCompanyStore} from '@/stores/use-company-store';

export async function validateCompanyWebsite(hotCopy: CompanyHotCopy) {
	const {inputValues, categoryValues} = hotCopy;
	const {name, country, url} = inputValues;
	if (!hotCopy.id) {
		alert('Company is not saved');
		return {result: null, error: 'Company is not saved'};
	}

	if (categoryValues.source.category.status === 'in_progress') {
		alert('Website is already being validated');
		return {result: null, error: 'Website is already being validated'};
	}
	if (!name || !country) {
		alert('Company name and country are required');
		return {result: null, error: 'Company name and country are required'};
	}

	// Create input settings string
	const inputSettings = createInputSettings(name, country, url);

	const inProgressStatus: WebsiteValidationStatus = {
		input_settings: inputSettings,
		is_validating: true,
		url_validated: null,
		url_validated_and_accessible: null,
	};
	useCompanyStore.getState().updateWebsiteValidation(hotCopy.id, inProgressStatus);

	// Get the benchmarkId from the store
	const benchmarkId = useCompanyStore.getState().benchmarkId;
	if (!benchmarkId) {
		alert('Benchmark ID is not available');
		return {result: null, error: 'Benchmark ID is not available'};
	}

	// Create the DTO
	const validateWebsiteDto: ValidateWebsiteDTO = {
		benchmarkId,
		companyId: hotCopy.id,
		companyName: name,
		country,
		databaseUrl: url,
	};

	const {result, error} = await validateAndFindWebsite(validateWebsiteDto);

	const update: WebsiteValidationStatus = {
		input_settings: inputSettings,
		url_validated: result?.official_url || null,
		url_validated_and_accessible: result?.validation_passed === true,
	};
	if (hotCopy.id) {
		useCompanyStore.getState().updateWebsiteValidation(hotCopy.id, update);
	}

	return {result, error};
}
