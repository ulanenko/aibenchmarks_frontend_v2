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

export async function validateCompanyWebsite(hotCopy: CompanyHotCopy | Company, updateState: boolean = true) {
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


	if (updateState) {
		useCompanyStore.getState().updateCompaniesWithAction(hotCopy.id, (company) => {
			company.markAsUrlValidationStarted();
		});
	}

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

	const {result, error} = await validateAndFindWebsite(validateWebsiteDto, updateState);
	if (!result) {
		if (updateState) {
			useCompanyStore.getState().updateCompaniesWithAction(hotCopy.id, (company) => {
				company.markAsUrlValidationStarted(false);
			});
		}
		return {result: null, error};
	}else{

		if (updateState) {
			useCompanyStore.getState().updateCompaniesWithAction(hotCopy.id, (company) => {
				company.updateWebsiteValidation(result);
			});
		}
		return {result, error: null};
	}
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
	const inputSettingsList: string[] = [];
	// Mark all selected companies as "in progress"
	companiesToValidate.forEach((company) => {
		const {name, country, url} = company.inputValues;
		// we can safely assume that the input values are not null because we filtered the companies
		const inputSettings = createInputSettings(name!, country!, url!);

		companiesToValidateIds.push(company.id);
		inputSettingsList.push(inputSettings);
		websiteValidateDTOs.push({
			id: company.id,
			name: name! ,
			country: country!,
			databaseUrl: url ,
		});
	});
	store.updateCompaniesWithAction(companiesToValidateIds, (company, index) => {
		company.markAsUrlValidationStarted();
	});

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
		results.forEach(({companyId, result}, index) => {
			const inputSettings = inputSettingsList[index];
			// Handle cases where the API returns "N/A" for the official URL
			const officialUrl = result?.official_url === 'N/A' ? null : result?.official_url;

			const update: WebsiteValidationStatus = {
				urlValidationInput: inputSettings,
				urlValidationUrl: officialUrl || '',
				urlValidationValid: result?.validation_passed || null,
			};
			companiesToValidateIds.push(companyId);
			companiesToValidateInputSettings.push(update);
		});
		validatedCompanies = store.updateCompaniesWithAction(companiesToValidateIds, (company, index) => {
			company.updateWebsiteValidation(companiesToValidateInputSettings[index]);
		});
	}

	return {validatedCompanies, error};
}
