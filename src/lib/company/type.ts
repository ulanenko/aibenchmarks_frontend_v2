import {StepStatus} from '@/db/schema';
import {company} from '@/db/schema';
import {SearchedCompany} from '@/services/backend/models/searchedCompany';

export type CompanyDBType = typeof company.$inferSelect;

export type CompanyDTO = {
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
	urlValidationUrl: string | null;
	urlValidationInput: string | null;
	urlValidationValid: boolean | null;
	searchId: string | null;
	searchedCompanyData: SearchedCompany | null;
};

// Type for company creation - omit auto-generated fields
export type CreateCompanyDTO = Partial<
	Omit<
		CompanyDTO,
		'id' | 'createdAt' | 'updatedAt' | 'benchmarkId' | 'urlValidationUrl' | 'urlValidationInput' | 'urlValidationValid'
	>
>;

// Type for company update
export type UpdateCompanyDTO = Partial<Omit<CompanyDTO, 'id'>> & {id: number};
