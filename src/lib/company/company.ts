import {CompanyDTO, CreateCompanyDTO, UpdateCompanyDTO} from './type';
import {updateCategories} from './utils';
import {setValueForPath} from '../object-utils';
import {isEmpty} from '../utils';
import {CategoryValue} from '@/types/category';
import {CATEGORIES} from '@/config/categories';

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

export class Company {
	private static tempIdCounter = -1;

	id: number;
	createdAt: Date;
	updatedAt: Date | null;
	benchmarkId: number;
	databaseId: string | null;
	sourceData: any;
	dataStatus: string | null;

	mappedSourceData: Partial<InputValues>;
	// User-inputted values moved to a nested object
	inputValues: InputValues;

	// Store original input values for change tracking
	private originalInputValues: InputValues;

	// Track which fields have been changed
	private changedFields: Set<string> = new Set();

	// a deep copy of the properties relevant for the hot table
	// this is updated after validating the company to ensure that the hot table is updated
	hotCopy: {[key: string]: any} = {};
	categoryValues: {
		[key: string]: CategoryValue;
	} = {
		input: {
			category: CATEGORIES.INPUT.NEW,
			label: '',
			description: '',
			categoryKey: CATEGORIES.INPUT.NEW.categoryKey,
		},
	};

	constructor(data?: CompanyDTO | CreateCompanyDTO) {
		this.id = data && 'id' in data ? data.id : Company.getNextTempId();
		this.createdAt = data && 'createdAt' in data ? data.createdAt : new Date();
		this.updatedAt = data && 'updatedAt' in data ? data.updatedAt : null;
		this.benchmarkId = data && 'benchmarkId' in data ? data.benchmarkId : -1;
		this.databaseId = data?.databaseId ?? null;
		this.sourceData = data?.sourceData ?? null;
		this.mappedSourceData = data?.mappedSourceData ?? null;
		this.dataStatus = data?.dataStatus ?? null;

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

		// Store a deep copy of the original input values
		this.originalInputValues = JSON.parse(JSON.stringify(this.inputValues));

		// Initialize changedFields as empty (no changes yet)
		this.changedFields = new Set();

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

	isCompleted(): string | true {
		if (isEmpty(this.inputValues.name)) {
			return 'name';
		}
		if (isEmpty(this.inputValues.country)) {
			return 'country';
		}
		if (isEmpty(this.inputValues.url)) {
			return 'url';
		}
		return true;
	}

	updateDependentValues() {
		updateCategories(this);
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
		this.hotCopy = {};
		this.hotCopy.inputValues = {...this.inputValues};
		this.hotCopy.categoryValues = this.categoryValues;
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
						this.changedFields.add(key);
					} else {
						// If the value is back to the original, remove it from changedFields
						this.changedFields.delete(key);
					}
				} else {
					// Update other properties
					(this as any)[key] = value;
				}
			}
		});

		// Update dependent values and hot copy
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
				dataStatus: this.dataStatus,
			} as UpdateCompanyDTO;
		}

		// For existing entities, only include changed fields
		if (this.changedFields.size > 0) {
			// Create a DTO with only the changed fields
			const dto: UpdateCompanyDTO = {id: this.id};

			// Add each changed field to the DTO
			this.changedFields.forEach((field) => {
				dto[field as keyof UpdateCompanyDTO] = this.inputValues[field as keyof InputValues];
			});

			return dto;
		}

		return null;
	}

	// Method to reset the original values after saving changes
	resetOriginalValues(): void {
		this.originalInputValues = JSON.parse(JSON.stringify(this.inputValues));
		this.changedFields.clear();
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
		return this.changedFields.size > 0;
	}

	// Get the number of changes
	getChangeCount(): number {
		return this.changedFields.size;
	}

	// Alias for hasChanges for better readability in some contexts
	isDirty(): boolean {
		return this.hasChanges();
	}

	// Get a summary of changes for display purposes
	getChangesSummary(): {count: number; fields: string[]} {
		return {
			count: this.changedFields.size,
			fields: Array.from(this.changedFields),
		};
	}
}
