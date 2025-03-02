import {StepStatus} from '@/db/schema';
import {company} from '@/db/schema';

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
};

// Type for company creation - omit auto-generated fields
export type CreateCompanyDTO = Partial<Omit<CompanyDTO, 'id' | 'createdAt' | 'updatedAt' | 'benchmarkId'>>;

// Type for company update
export type UpdateCompanyDTO = Partial<Omit<CompanyDTO, 'id'>> & {id: number};
