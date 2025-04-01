import {StepStatus} from '@/db/schema';
import {company} from '@/db/schema';
import {SearchedCompany} from '@/services/backend/models/searchedCompany';

export type CompanyDBType = typeof company.$inferSelect;

export type CompanyDTO = {
	id: number;
	name: string | null;
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

	// Site match risk ignored
	siteMatchRiskIgnored: boolean | null;

	// Human review fields
	cfSufficientDataHRDecision: string | null;
	cfSufficientDataHRMotivation: string | null;
	cfProductsServicesHRDecision: string | null;
	cfProductsServicesHRMotivation: string | null;
	cfFunctionalProfileHRDecision: string | null;
	cfFunctionalProfileHRMotivation: string | null;
	cfIndependenceHRDecision: string | null;
	cfIndependenceHRMotivation: string | null;
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
