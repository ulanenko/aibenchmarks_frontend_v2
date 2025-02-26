import {CompanyDTO, UpdateCompanyDTO} from './type';
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

	changes: Record<
		string,
		{
			value: any;
			oldValue: any;
		}
	> = {};

	constructor(data?: CompanyDTO) {
		this.id = data && 'id' in data ? data.id : Company.getNextTempId();
		this.createdAt = data && 'createdAt' in data ? data.createdAt : new Date();
		this.updatedAt = data && 'updatedAt' in data ? data.updatedAt : null;
		this.benchmarkId = data?.benchmarkId ?? 0;
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

	// Method to update company data
	update(changes: Record<string, any>) {
		this.updatedAt = new Date();
		Object.entries(changes).forEach(([key, value]) => {
			setValueForPath(this, key, value);
			if (this.changes[key]?.oldValue === value) {
				delete this.changes[key];
			} else {
				this.changes[key] = {value, oldValue: this.changes[key]?.value ?? value};
			}
		});
		this.updateDependentValues();
	}

	// Convert to plain object (DTO)
	getUpdateDTO(): UpdateCompanyDTO | null {
		if (Object.keys(this.changes).length > 0) {
			// Create a flattened copy for the DTO
			const copy: UpdateCompanyDTO = {
				id: this.id,
				// Include all inputValues properties
				...this.inputValues,
				// Include other properties
				benchmarkId: this.benchmarkId,
				databaseId: this.databaseId,
				sourceData: this.sourceData,
				mappedSourceData: this.mappedSourceData,
				dataStatus: this.dataStatus,
				updatedAt: this.updatedAt,
				createdAt: this.createdAt,
			} as UpdateCompanyDTO;

			//
			const changedKeys = [...Object.keys(this.changes), 'id'].map((key) => key.replace('inputValues.', ''));
			const objectKeys = Object.keys(copy);
			const keysToRemove = objectKeys.filter((key) => !changedKeys.includes(key));
			keysToRemove.forEach((key) => {
				delete copy[key as keyof UpdateCompanyDTO];
			});
			return copy;
		}
		return null;
	}

	// Static method to create from database type
	static fromDB(data: CompanyDTO): Company {
		return new Company(data);
	}
}
