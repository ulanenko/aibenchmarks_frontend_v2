import {CompanyDTO, UpdateCompanyDTO} from './type';
import {validateCompany} from './utils';
import {setValueForPath} from '../object-utils';
import {isEmpty} from '../utils';
import {CategoryValue} from '@/config/labeller';
import {CATEGORIES} from '@/config/categories';

export class Company implements CompanyDTO {
	private static tempIdCounter = -1;

	id: number;
	name: string;
	createdAt: Date;
	updatedAt: Date | null;
	benchmarkId: number;
	databaseId: string | null;
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
	sourceData: any;
	mappedSourceData: any;
	dataStatus: string | null;
	// a deep copy of the properties relevant for the hot table
	// this is updated after validating the company to ensure that the hot table is updated
	hotCopy: {[key: string]: any} = {};
	step: {
		input: CategoryValue;
	} = {
		input: {
			category: CATEGORIES.INPUT.NEW,
			label: '',
			description: '',
			categoryKey: CATEGORIES.INPUT.NEW.label,
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
		this.name = data?.name ?? '';
		this.createdAt = data && 'createdAt' in data ? data.createdAt : new Date();
		this.updatedAt = data && 'updatedAt' in data ? data.updatedAt : null;
		this.benchmarkId = data?.benchmarkId ?? 0;
		this.databaseId = data?.databaseId ?? null;
		this.country = data?.country ?? null;
		this.url = data?.url ?? null;
		this.streetAndNumber = data?.streetAndNumber ?? null;
		this.addressLine1 = data?.addressLine1 ?? null;
		this.consolidationCode = data?.consolidationCode ?? null;
		this.independenceIndicator = data?.independenceIndicator ?? null;
		this.naceRev2 = data?.naceRev2 ?? null;
		this.fullOverview = data?.fullOverview ?? null;
		this.fullOverviewManual = data?.fullOverviewManual ?? null;
		this.tradeDescriptionEnglish = data?.tradeDescriptionEnglish ?? null;
		this.tradeDescriptionOriginal = data?.tradeDescriptionOriginal ?? null;
		this.mainActivity = data?.mainActivity ?? null;
		this.mainProductsAndServices = data?.mainProductsAndServices ?? null;
		this.sourceData = data?.sourceData ?? null;
		this.mappedSourceData = data?.mappedSourceData ?? null;
		this.dataStatus = data?.dataStatus ?? null;
		this.validate();
	}

	private static getNextTempId(): number {
		return this.tempIdCounter--;
	}

	isEmpty(): boolean {
		return [this.name, this.country, this.url].every(isEmpty);
	}
	isCompleted(): string | true {
		if (isEmpty(this.name)) {
			return 'name';
		}
		if (isEmpty(this.country)) {
			return 'country';
		}
		if (isEmpty(this.url)) {
			return 'url';
		}
		return true;
	}

	validate(): boolean {
		const value = validateCompany(this);
		// update the hotCopy to ensure that the hot table is updated
		this.updateHOTExport();
		return value.length === 0;
	}

	// Helper method to check if the entity is new
	isNew(): boolean {
		return this.id < 0;
	}

	updateHOTExport() {
		const copy = {...this} as any;
		delete copy.changes;
		const categories = this.step;
		this.hotCopy = JSON.parse(JSON.stringify(copy));
		this.hotCopy.step = categories;
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
		this.validate();
	}

	// Convert to plain object (DTO)
	getUpdateDTO(): UpdateCompanyDTO | null {
		if (Object.keys(this.changes).length > 0) {
			const copy: UpdateCompanyDTO = {...this} as UpdateCompanyDTO;
			const changedKeys = [...Object.keys(this.changes), 'id'];
			const objectKeys = Object.keys(this);
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
