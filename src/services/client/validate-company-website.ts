import {
	validateAndFindWebsite,
	validateAndFindWebsiteBatch,
	ValidateWebsiteDTO,
	ValidateWebsiteBatchDTO,
	WebsiteValidateDTO,
} from '@/app/actions/website-validation-actions';
import {CATEGORIES} from '@/config/categories';
import {Company, CompanyHotCopy} from '@/lib/company/company';
import {WebsiteValidationStatus, createInputSettings} from '@/lib/company/website-validation';
import {useCompanyStore} from '@/stores/use-company-store';

export async function validateCompanyWebsite(hotCopy: CompanyHotCopy | Company) {
	const {inputValues, categoryValues} = hotCopy;
	if (!hotCopy.id) {
		alert('Company is not saved');
		return {result: null, error: 'Company is not saved'};
	}
	const {name, country, url} = inputValues!;

	if (categoryValues?.WEBSITE.category.status === 'in_progress') {
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
		id: hotCopy.id,
		name,
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

export async function validateCompanyWebsiteBatch() {
	// Get companies and benchmarkId from the store
	const store = useCompanyStore.getState();
	const {companies, benchmarkId} = store;

	if (!benchmarkId) {
		return {results: null, error: 'Benchmark ID is not available'};
	}

	// Find companies that haven't been validated or need validation
	const companiesToValidate = companies.filter((company) => {
		// Skip companies that are already being validated
		return company.categoryValues?.INPUT.categoryKey === CATEGORIES.INPUT.READY.categoryKey;
	});

	if (companiesToValidate.length === 0) {
		return {results: null, error: 'No companies need validation'};
	}

	const companiesToValidateIds: number[] = [];
	const companiesToValidateInputSettings: WebsiteValidationStatus[] = [];
	const websiteValidateDTOs: WebsiteValidateDTO[] = [];
	// Mark all selected companies as "in progress"
	companiesToValidate.forEach((company) => {
		if (!company.id) return;

		const {name, country, url} = company.inputValues;
		const inputSettings = createInputSettings(name, country || '', url);

		companiesToValidateIds.push(company.id);
		companiesToValidateInputSettings.push({
			input_settings: inputSettings,
			is_validating: true,
			url_validated: null,
			url_validated_and_accessible: null,
		});
		websiteValidateDTOs.push({
			id: company.id,
			name,
			country: country!,
			databaseUrl: url,
		});
	});
	store.updateWebsiteValidation(companiesToValidateIds, companiesToValidateInputSettings);

	// Create the batch validation DTO
	const validateWebsiteDto: ValidateWebsiteBatchDTO = {
		benchmarkId,
		companies: websiteValidateDTOs,
	};

	// Execute the batch validation
	const {results, error} = await validateAndFindWebsiteBatch(validateWebsiteDto);
	let validatedCompanies: Company[] | null = null;
	// Update the store with validation results
	if (results) {
		const companiesToValidateIds: number[] = [];
		const companiesToValidateInputSettings: WebsiteValidationStatus[] = [];
		results.forEach(({companyId, result}) => {
			const company = companies.find((c) => c.id === companyId);
			if (!company || !result) return;

			const {name, country, url} = company.inputValues;
			const inputSettings = createInputSettings(name, country || '', url);

			// Handle cases where the API returns "N/A" for the official URL
			const officialUrl = result.official_url === 'N/A' ? null : result.official_url;

			const update: WebsiteValidationStatus = {
				input_settings: inputSettings,
				url_validated: officialUrl,
				url_validated_and_accessible: result.validation_passed === true,
			};
			companiesToValidateIds.push(companyId);
			companiesToValidateInputSettings.push(update);
		});
		validatedCompanies = store.updateWebsiteValidation(companiesToValidateIds, companiesToValidateInputSettings);
	}

	return {validatedCompanies, error};
}
