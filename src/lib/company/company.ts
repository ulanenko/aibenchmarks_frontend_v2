import {CompanyDTO, CreateCompanyDTO, UpdateCompanyDTO} from './type';
import {updateCategories} from './utils';
import {setValueForPath} from '../object-utils';
import {checkUrlChanged, isEmpty} from '../utils';
import {CategoryValue} from '@/types/category';
import {CATEGORIES, CategoryType} from '@/config/categories';
import {WebsiteValidationStatus, createInputSettings} from './website-validation';
import {SearchedCompany} from '@/services/backend/models/searchedCompany';

export interface InputValues {
	name: string;
	country: string | null;
	url: string | null;
	streetAndNumber: string | null;
	addressLine1: string | null;
	consolidationCode: string | null;
	independenceIndicator: string | null;
	naceRev2: string | null;
	fullOverview: string | null;
	fullOverviewManual: string | null;
	tradeDescriptionEnglish: string | null;
	tradeDescriptionOriginal: string | null;
	mainActivity: string | null;
	mainProductsAndServices: string | null;
}

export type DynamicInputValues = {
	url: string | null | undefined;
	urlValidationStatus: 'input' | 'updated' | 'fine-tuned' | 'correct' | 'invalid';
};

// Frontend state to track UI-specific states that don't belong in the database
export type FrontendState = {
	webSearchInitialized?: boolean;
};

// Backend state to track values set by the backend
export type BackendState = {
	searchId: string | null;
};

export type CompanyHotCopy = {
	id: number | null;
	inputValues: InputValues | null;
	categoryValues:
		| {
				[key in CategoryType]: CategoryValue;
		  }
		| undefined;
	dynamicInputValues: DynamicInputValues | null;
	frontendState?: FrontendState;
	backendState?: BackendState;
	searchedCompanyData: SearchedCompany | null;
};

export class Company {
	private static tempIdCounter = -1;

	id: number;
	createdAt: Date;
	updatedAt: Date | null;
	benchmarkId: number;
	databaseId: string | null;
	sourceData: any;

	mappedSourceData: Partial<InputValues>;
	// User-inputted values moved to a nested object
	inputValues: InputValues;

	// Website validation status
	websiteValidation: WebsiteValidationStatus | null = null;

	// Store original input values for change tracking
	private originalInputValues: InputValues;
	dynamicInputValues: DynamicInputValues = {
		url: null,
		urlValidationStatus: 'input',
	};

	// Frontend state for tracking UI states that shouldn't persist in the database
	frontendState: FrontendState = {};

	// Backend state for tracking values set by the backend
	backendState: BackendState = {
		searchId: null,
	};

	// Track which fields have been changed
	changedFields: Partial<InputValues> = {};

	// a deep copy of the properties relevant for the hot table
	// this is updated after validating the company to ensure that the hot table is updated
	hotCopy: CompanyHotCopy = {
		id: null,
		inputValues: null,
		categoryValues: undefined,
		dynamicInputValues: null,
		searchedCompanyData: null,
	};
	categoryValues:
		| {
				[key in CategoryType]: CategoryValue;
		  }
		| undefined;

	// Searched company data
	searchedCompanyData: SearchedCompany | null = null;

	constructor(data?: CompanyDTO | CreateCompanyDTO) {
		this.id = data && 'id' in data ? data.id : Company.getNextTempId();
		this.createdAt = data && 'createdAt' in data ? data.createdAt : new Date();
		this.updatedAt = data && 'updatedAt' in data ? data.updatedAt : null;
		this.benchmarkId = data && 'benchmarkId' in data ? data.benchmarkId : -1;
		this.databaseId = data?.databaseId ?? null;
		this.sourceData = data?.sourceData ?? null;
		this.mappedSourceData = data?.mappedSourceData ?? null;

		// Initialize inputValues
		this.inputValues = {
			name: data?.name ?? '',
			country: data?.country ?? null,
			url: data?.url ?? null,
			streetAndNumber: data?.streetAndNumber ?? null,
			addressLine1: data?.addressLine1 ?? null,
			consolidationCode: data?.consolidationCode ?? null,
			independenceIndicator: data?.independenceIndicator ?? null,
			naceRev2: data?.naceRev2 ?? null,
			fullOverview: data?.fullOverview ?? null,
			fullOverviewManual: data?.fullOverviewManual ?? null,
			tradeDescriptionEnglish: data?.tradeDescriptionEnglish ?? null,
			tradeDescriptionOriginal: data?.tradeDescriptionOriginal ?? null,
			mainActivity: data?.mainActivity ?? null,
			mainProductsAndServices: data?.mainProductsAndServices ?? null,
		};

		// Initialize backendState
		this.backendState = {
			searchId: data?.searchId ?? null,
		};

		// Initialize searchedCompanyData
		this.searchedCompanyData =
			data && 'searchedCompanyData' in data && data.searchedCompanyData !== undefined ? data.searchedCompanyData : null;

		this.websiteValidation =
			data && 'urlValidationUrl' in data && data.urlValidationUrl
				? {
						url_validated: data!.urlValidationUrl!,
						input_settings: data!.urlValidationInput!,
						url_validated_and_accessible: data!.urlValidationValid!,
				  }
				: null;

		// Store a deep copy of the original input values
		this.originalInputValues = JSON.parse(JSON.stringify(this.inputValues));

		// Initialize changedFields as empty (no changes yet)
		this.changedFields = {};

		this.updateDependentValues();
	}

	private static getNextTempId(): number {
		return this.tempIdCounter--;
	}

	// Getters to maintain compatibility with CompanyDTO interface
	get name(): string {
		return this.inputValues.name;
	}

	get url(): string | null {
		return this.inputValues.url;
	}

	isEmpty(): boolean {
		return [this.inputValues.name, this.inputValues.country, this.inputValues.url].every(isEmpty);
	}

	requiredInputProvided(): string | true {
		if (isEmpty(this.inputValues.name)) {
			return 'name';
		}
		if (isEmpty(this.inputValues.country)) {
			return 'country';
		}
		// if (isEmpty(this.inputValues.url)) {
		// 	return 'url';
		// }
		return true;
	}

	updateDependentValues() {
		updateCategories(this);
		// source status
		let urlValidationStatus: 'input' | 'updated' | 'fine-tuned' | 'correct' | 'invalid' = 'input';
		const websiteIsValid = this.categoryValues?.WEBSITE.category.passed === true;
		const websiteIsValidated = this.categoryValues?.WEBSITE.category.passed !== undefined;
		if (websiteIsValidated) {
			if (websiteIsValid) {
				if (this.websiteValidation?.url_validated === this.inputValues.url) {
					urlValidationStatus = 'correct';
				} else {
					urlValidationStatus = checkUrlChanged(this.websiteValidation?.url_validated, this.inputValues.url)
						? 'updated'
						: 'fine-tuned';
				}
			} else {
				urlValidationStatus = 'invalid';
			}
		}

		this.dynamicInputValues = {
			url: websiteIsValid ? this.websiteValidation?.url_validated : this.inputValues.url,
			urlValidationStatus,
		};

		// update the hotCopy to ensure that the hot table is updated
		this.updateHOTExport();
	}

	// Helper method to check if the entity is new
	isNew(): boolean {
		return this.id < 0;
	}

	updateHOTExport() {
		// const copy = {...this} as any;
		// delete copy.changes;
		// const categories = this.categoryValues;
		this.hotCopy = {
			id: this.id,
			inputValues: {...this.inputValues},
			dynamicInputValues: {...this.dynamicInputValues},
			categoryValues: this.categoryValues,
			frontendState: {...this.frontendState},
			backendState: {...this.backendState},
			searchedCompanyData: this.searchedCompanyData,
		};
	}

	// Method to update company data from a DTO
	updateFromDTO(dto: Partial<UpdateCompanyDTO>) {
		this.updatedAt = new Date();

		// Apply changes directly to the appropriate properties
		Object.entries(dto).forEach(([key, value]) => {
			if (key !== 'id') {
				// Update inputValues properties
				if (key in this.inputValues) {
					const originalValue = this.originalInputValues[key as keyof InputValues];
					const newValue = value;

					// Update the value
					(this.inputValues as any)[key] = newValue;

					// Check if the value has changed from the original
					if (JSON.stringify(newValue) !== JSON.stringify(originalValue)) {
						this.changedFields[key as keyof InputValues] = newValue;
					} else {
						// If the value is back to the original, remove it from changedFields
						delete this.changedFields[key as keyof InputValues];
					}
				} else if (key === 'websiteValidation') {
					// Handle websiteValidation property
					this.websiteValidation = value as WebsiteValidationStatus;
				} else {
					// Update other properties
					(this as any)[key] = value;
				}
			}
		});

		// Update dependent values and hot copy
		this.updateDependentValues();
	}

	updateWebsiteValidation(websiteValidation: WebsiteValidationStatus) {
		this.websiteValidation = websiteValidation;
		this.updateDependentValues();
	}

	// Convert to plain object (DTO)
	getUpdateDTO(): UpdateCompanyDTO | null {
		// For new entities, include all input values
		if (this.isNew()) {
			return {
				id: this.id,
				...this.inputValues,
				benchmarkId: this.benchmarkId,
				databaseId: this.databaseId,
				sourceData: this.sourceData,
				mappedSourceData: this.mappedSourceData,
			} as UpdateCompanyDTO;
		}

		// For existing entities, only include changed fields
		if (Object.keys(this.changedFields).length > 0) {
			// Create a DTO with only the changed fields
			const dto: UpdateCompanyDTO = {id: this.id, ...this.changedFields};

			return dto;
		}

		return null;
	}

	// Method to reset the original values after saving changes
	resetOriginalValues(): void {
		this.originalInputValues = JSON.parse(JSON.stringify(this.inputValues));
		this.changedFields = {};
	}

	// Static method to create from database type
	static fromDB(data: CompanyDTO): Company {
		return new Company(data);
	}

	// Check if the company has any changes
	hasChanges(): boolean {
		// New companies always need to be saved
		if (this.isNew()) {
			return true;
		}

		// Check if any fields have been changed
		return Object.keys(this.changedFields).length > 0;
	}

	// Get the number of changes
	getChangeCount(): number {
		return Object.keys(this.changedFields).length;
	}

	// Alias for hasChanges for better readability in some contexts
	isDirty(): boolean {
		return this.hasChanges();
	}

	// Get a summary of changes for display purposes
	getChangesSummary(): {count: number; fields: string[]} {
		return {
			count: Object.keys(this.changedFields).length,
			fields: Object.keys(this.changedFields),
		};
	}
}
