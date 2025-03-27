import {CompanyDTO, CreateCompanyDTO, UpdateCompanyDTO} from './type';
import {updateCategories, updateDynamicInputValues} from './utils';
import {setValueForPath} from '../object-utils';
import {checkUrlChanged, isEmpty} from '../utils';
import {CategoryValue} from '@/types/category';
import {CATEGORIES, CategoryType} from '@/config/categories';
import {WebsiteValidationStatus, createInputSettings} from './website-validation';
import {SearchedCompany} from '@/services/backend/models/searchedCompany';
import { ValidateWebsiteDTO } from '@/app/actions/website-validation-actions';

export interface InputValues {
	name: string | null;
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
	acceptRejectInitialized?: boolean;
	expanded?: boolean;
	selected?: boolean;
	urlValidationInitialized?: boolean;
};

export type UpdateState = {
	id: number;
	frontendState?: Partial<FrontendState>;
	inputValues?: Partial<InputValues>;
}

// Backend state to track values set by the backend
export type BackendState = {
	searchId: string | null;
	urlValidationUrl: string | null | undefined;
	urlValidationInput: string | null | undefined;
	urlValidationValid: boolean | null | undefined;

};

export type CompanyHotCopy = {
	id: number | null;
	inputValues: InputValues | null;
	categoryValues:
		| {
				[key in CategoryType]: CategoryValue;
		  }
		| undefined;
	dynamicInputValues: DynamicInputValues | {};
	frontendState?: FrontendState;
	backendState?: BackendState;
	searchedCompanyData: SearchedCompany | {};
};

export class Company {
	private static tempIdCounter = -1;

	id: number;
	createdAt: Date;
	updatedAt: Date | null;
	benchmarkId: number;
	sourceData: any;

	mappedSourceData: Partial<InputValues>;
	// User-inputted values moved to a nested object
	inputValues: InputValues;

	// Website validation status
	// websiteValidation: WebsiteValidationStatus | null = null;

	// Store original input values for change trackinge
	private originalInputValues: InputValues;
	dynamicInputValues: DynamicInputValues = {
		url: null,
		urlValidationStatus: 'input',
	};



	// Frontend state for tracking UI states that shouldn't persist in the database
	frontendState: FrontendState = {
		webSearchInitialized: false,
		acceptRejectInitialized: false,
		expanded: false,
		selected: false,
		urlValidationInitialized: false,
	};

	// Backend state for tracking values set by the backend
	backendState: BackendState = {
		searchId: null,
		urlValidationUrl: null,
		urlValidationInput: null,
		urlValidationValid: null,
	};

	// Track which fields have been changed
	changedFields: Partial<InputValues> = {};

	// a deep copy of the properties relevant for the hot table
	// this is updated after validating the company to ensure that the hot table is updated
	hotCopy: CompanyHotCopy = {
		id: null,
		inputValues: null,
		categoryValues: undefined,
		dynamicInputValues: {},
		searchedCompanyData: {},
	};
	categoryValues:
		| {
				[key in CategoryType]: CategoryValue;
		  }
		| undefined;

	// Searched company data
	searchedCompanyData: SearchedCompany | null = null;

	constructor(data?: CompanyDTO | CreateCompanyDTO | InputValues) {
		this.id = data && 'id' in data ? data.id : Company.getNextTempId();
		this.createdAt = data && 'createdAt' in data ? data.createdAt : new Date();
		this.updatedAt = data && 'updatedAt' in data ? data.updatedAt : null;
		this.benchmarkId = data && 'benchmarkId' in data ? data.benchmarkId : -1;
		this.mappedSourceData = data && 'mappedSourceData' in data ? data.mappedSourceData : null;

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

		
		// for existing companies, set the searchId and searchedCompanyData
		if(data && 'id' in data){
			this.backendState = {
				searchId: data?.searchId ?? null,
				urlValidationUrl: data?.urlValidationUrl ?? null,
				urlValidationInput: data?.urlValidationInput ?? null,
				urlValidationValid: data?.urlValidationValid ?? null,
			};
			this.searchedCompanyData = data?.searchedCompanyData ?? null;
			
		}

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
		return this.inputValues.name ?? '';
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
		updateDynamicInputValues(this);

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
			searchedCompanyData: this.searchedCompanyData ?? {},
		};
	}

	// Method to update company data from a DTO
	update(updateState: UpdateState) {
		this.updatedAt = new Date();

		// Apply changes directly to the appropriate properties
		const {frontendState = {}, inputValues = {}} = updateState;
		Object.entries(inputValues).forEach(([key, value]) => {
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
				}
			}
		});
		Object.entries(frontendState).forEach(([key, value]) => {
			this.frontendState[key as keyof FrontendState] = value as FrontendState[keyof FrontendState];
		});

		// Update dependent values and hot copy
		this.updateDependentValues();
	}

	/**
	 * Marks the company as having a validation in progress
	 * @param started - whether the validation has started or stopped
	 */
	markAsUrlValidationStarted(started: boolean = true) {
		const {name, country, url} = this.inputValues;
		// just the country and name are required to initialize the validation
		const canInitialize = name && country ;
		if(!canInitialize) {
			this.frontendState.urlValidationInitialized = false;
		}else{
			this.backendState.urlValidationInput = createInputSettings(name, country, url);;
			this.frontendState.urlValidationInitialized = started;
			this.backendState.urlValidationUrl = null;
			this.backendState.urlValidationValid = null;
		}
		// we don't have to reset the backend state because we check if these are still relevant
		this.updateDependentValues();
	}

	updateWebsiteValidation(validationResult: WebsiteValidationStatus) {
		this.frontendState.urlValidationInitialized = false;
		this.backendState.urlValidationUrl = validationResult.urlValidationUrl;
		this.backendState.urlValidationInput = validationResult.urlValidationInput;
		this.backendState.urlValidationValid = validationResult.urlValidationValid;
		this.updateDependentValues();
	}

	// updateWebsiteValidation(websiteValidation: WebsiteValidationStatus) {
	// 	this.websiteValidation = websiteValidation;
	// 	this.updateDependentValues();
	// }

	// Convert to plain object (DTO)
	getUpdateDTO(): UpdateCompanyDTO | null {
		// For new entities, include all input values
		if (this.isNew()) {
			return {
				id: this.id,
				...this.inputValues,
				benchmarkId: this.benchmarkId,
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
	markAsSearchStarted() {
		this.frontendState.webSearchInitialized = true;
		this.searchedCompanyData = null;
		this.backendState.searchId = null;
		this.updateDependentValues();
	}
	// Update search data for the company
	updateSearchData(searchId: string | null, searchedCompanyData: SearchedCompany | null) {
		this.frontendState.webSearchInitialized = false;
		this.backendState.searchId = searchId;
		this.searchedCompanyData = searchedCompanyData;
		this.updateDependentValues();
	}

	// Add methods for accept-reject analysis
	/**
	 * Marks the company as having an accept-reject analysis in progress
	 */
	markAsAcceptRejectStarted(started: boolean = true) {
		this.frontendState.acceptRejectInitialized = started;
		this.updateDependentValues();
	}
}
