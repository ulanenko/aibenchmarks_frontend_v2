import {BaseRenderer} from 'handsontable/renderers';
import {ValidatorCallback} from '@/types/handsontable';
import {Column, CategoryColumn} from '@/lib/column-definition';
import {urlRenderer, websiteValidationRenderer, descriptionRenderer, expandToggleRenderer} from '@/components/hot/renderers';
import {InputLabelsDescriptions} from './categorizer/inputCategorizer';
import {DescriptionCategorizer, SiteMatchCategorizer, WebsiteCategorizer} from './categorizer/sourceCategorizer';
import AcceptRejectCategorizer from './categorizer/acceptRejectCategorizer';
import { collapsibleRenderer } from '@/components/hot/renderers/collapsible-renderer';
import { WebSearchCategorizer } from './categorizer/websearchCategorizer';
import { comparabilityRenderer } from '@/components/hot/renderers/comparability-renderer';
import { ColumnComparabilityDefinition } from '@/lib/column-comparability-definition';
import { humanReviewRenderer } from '@/components/hot/renderers/human-review-renderer';
import ReviewPriorityCategorizer from './categorizer/reviewPriorityCategorizer';
import HumanReviewCategorizer from './categorizer/humanReviewCategorizer';
import { Box } from 'lucide-react';
import SourceUsedCategorizer from './categorizer/sourceUsedCategorizer';

export const inputColumnDefinitions = {
	selected: new Column({
		title: '✓',
		// title: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
		type: 'checkbox',
		width: 60,
		hotProps: {
			className: 'htCenter htMiddle',
		},
		data: 'frontendState.selected',
		readOnly: false,	
		description: 'Select the company',
	}),
	id: new Column({
		title: 'ID',
		type: 'text',
		width: 60,
		data: 'id',
		readOnly: true,
		description: 'ID of the company',
	}),
	expandToggle: new Column({
		title: '',
		type: 'text',
		width: 60,
		data: 'expandToggle', // Just using id as a data reference, doesn't matter
		renderer: expandToggleRenderer,
		readOnly: true,
		description: 'Expand or collapse description text',
	}),
	name: new Column({
		title: 'Company Name',
		type: 'text',
		width: 200,
		data: 'inputValues.name',
		required: true,
		validator: (value: string, callback: ValidatorCallback) => {
			callback(!!value?.trim());
		},
		description: 'Name of the company',
	}),

	country: new Column({
		title: 'Country',
		type: 'text',
		width: 120,
		data: 'inputValues.country',
		required: true,
		validator: (value: string, callback: ValidatorCallback) => {
			callback(!!value?.trim());
		},
		description: 'Country where the company is based',
	}),
	url: new Column({
		title: 'Website',
		type: 'text',
		width: 200,
		// we use the dynamicInputValues.url to show the url from the source validation
		data: 'inputValues.url',
		hotProps: {
			dataToShow: 'dynamicInputValues.url',
		},
		renderer: urlRenderer,
		description: 'Website of the company',
	}),

	streetAndNumber: new Column({
		title: 'Street & Number',
		type: 'text',
		width: 150,
		data: 'inputValues.streetAndNumber',
		description: 'Street and number of the company',
	}),
	addressLine1: new Column({
		title: 'Address Line 1',
		type: 'text',
		width: 150,
		data: 'inputValues.addressLine1',
		description: 'First address line of the company',
	}),
	consolidationCode: new Column({
		title: 'Consolidation Code',
		type: 'text',
		width: 150,
		data: 'inputValues.consolidationCode',
		description: 'Consolidation code of the company',
	}),
	independenceIndicator: new Column({
		title: 'Independence Indicator',
		type: 'text',
		width: 150,
		data: 'inputValues.independenceIndicator',
		description: 'Independence indicator of the company',
	}),
	naceRev2: new Column({
		title: 'NACE Rev.2',
		type: 'text',
		width: 120,
		data: 'inputValues.naceRev2',
		description: 'NACE revision 2 code of the company',
	}),
	fullOverview: new Column({
		title: 'Full Overview',
		type: 'text',
		width: 200,
		data: 'inputValues.fullOverview',
		description: 'Complete overview of the company',
		renderer: collapsibleRenderer,
	}),

	tradeDescriptionEnglish: new Column({
		title: 'Trade Description (English)',
		type: 'text',
		width: 200,
		data: 'inputValues.tradeDescriptionEnglish',
		description: 'English description of the company trade',
		renderer: collapsibleRenderer,
	}),
	tradeDescriptionOriginal: new Column({
		title: 'Trade Description (Original)',
		type: 'text',
		width: 200,
		data: 'inputValues.tradeDescriptionOriginal',
		renderer: collapsibleRenderer,
		description: 'Original language description of the company trade',
	}),
	mainActivity: new Column({
		title: 'Main Activity',
		type: 'text',
		width: 200,
		data: 'inputValues.mainActivity',
		description: 'Main activity of the company',
		renderer: collapsibleRenderer,
	}),
	mainProductsAndServices: new Column({
		title: 'Main Products & Services',
		type: 'text',
		width: 200,
		data: 'inputValues.mainProductsAndServices',
		description: 'Main products and services offered by the company',
		renderer: collapsibleRenderer,
	}),
};

const websearchColumnDefinitions = {
	
	searchId: new Column({
		title: 'Search ID',
		type: 'text',
		width: 200,
		data: 'backendState.searchId',
		description: 'Search ID of the company',
	}),
	urlAnalysis: new Column({
		title: 'URL Analysis',
		type: 'text',
		width: 200,
		data: 'searchedCompanyData.website',
		description: 'URL analysis of the company',
	}),
	analysisMethod: new Column({
		title: 'Analysis Method',
		type: 'text',
		width: 200,
		data: 'searchedCompanyData.analysis_method',
		description: 'Analysis method of the company',
	}),

	siteMatchStatus: new CategoryColumn({
		title: 'Site Match Status',
		description: 'Status of site match for the company',
		valuePath: 'SITE_MATCH',
		categorizer: SiteMatchCategorizer,
	}),
	sourceUsedStatus: new CategoryColumn({
		title: 'Source Used Status',
		description: 'Status of source used for the company',
		valuePath: 'SOURCE_USED',
		categorizer: SourceUsedCategorizer,
	}),
	overallStatus: new Column({
		title: 'Overall Status',
		type: 'text',
		width: 200,
		data: 'searchedCompanyData.overall_status',
		description: 'Status of web search results for the company',
	}),
	analysisBusinessDescription: new Column({
		title: 'Analysis Business Description',
		type: 'text',
		width: 200,
		data: 'searchedCompanyData.business_description',
		renderer: descriptionRenderer,
		description: 'Business description of the company',
	}),
	analysisProductServiceDescription: new Column({
		title: 'Analysis Product Service Description',
		type: 'text',
		width: 200,
		data: 'searchedCompanyData.product_service_description',
		renderer: descriptionRenderer,
		description: 'Product service description of the company',
	}),
	analysisFunctionalProfileDescription: new Column({
		title: 'Analysis Functional Profile Description',
		type: 'text',
		width: 200,
		data: 'searchedCompanyData.functional_profile_description',
		renderer: descriptionRenderer,
		description: 'Functional profile description of the company',
	}),
	analysisCorporateStructureAndAffiliationsSummary: new Column({
		title: 'Analysis Corporate Structure And Affiliations Summary',
		type: 'text',
		width: 200,
		data: 'searchedCompanyData.corporatestructureandaffiliations_summary',
		renderer: descriptionRenderer,
		description: 'Corporate structure and affiliations summary of the company',
	}),
};

export const comparabilityColumnDefinitions = {
	compFactorProductService: new Column({
		title: 'Product/services',
		type: 'text',
		width: 200,
		data: 'searchedCompanyData.productservicecomparability_status',
		description: 'Comparability status of the company',
		renderer: comparabilityRenderer,
		hotProps: {
			motivationPath: 'searchedCompanyData.productservicecomparability_explanation',
		},
	}),
	compFactorFunctionalProfile: new Column({
		title: 'Functional Profile',
		type: 'text',
		width: 200,
		data: 'searchedCompanyData.functionalprofilecomparability_status',
		description: 'Comparability status of the company',
		renderer: comparabilityRenderer,
		hotProps: {
			motivationPath: 'searchedCompanyData.functionalprofilecomparability_explanation',
		},
	}),
	compFactorIndependence: new Column({
		title: 'Independence',
		type: 'text',
		width: 200,
		data: 'searchedCompanyData.independence_status',
		description: 'Comparability status of the company',
		renderer: comparabilityRenderer,
		hotProps: {
			motivationPath: 'searchedCompanyData.independence_explanation',
		},
	}),
};


const comparabilityColumnDefinitionNew = {
	// cfDataQuality: new ColumnComparabilityDefinition({
	// 	title: 'Data Quality',
	// 	type: 'text',
	// 	width: 200,
	// 	description: 'Comparability status of the company',
	// 	aiDecisionPath: 'searchedCompanyData.dataquality_status',
	// 	humanDecisionPath: 'inputValues.cfDataQualityHRDecision',
	// 	aiMotivationPath: 'searchedCompanyData.dataquality_explanation',
	// 	humanMotivationPath: 'inputValues.cfDataQualityHRMotivation',
	// 	aiDescriptionPath: 'searchedCompanyData.dataquality_explanation',
	// 	cfFactor: 'dataQuality',
	// 	columnType: 'humanreview',
	// 	renderer: humanReviewRenderer,
	// }),
	cfProducts: new ColumnComparabilityDefinition({
		title: 'Products/Services',
		type: 'text',
		width: 200,
		description: 'Comparability status of the company',
		aiDecisionPath: 'searchedCompanyData.productservicecomparability_status',
		humanDecisionPath: 'inputValues.cfProductsServicesHRDecision',
		aiMotivationPath: 'searchedCompanyData.productservicecomparability_explanation',
		humanMotivationPath: 'inputValues.cfProductsServicesHRMotivation',
		aiDescriptionPath: 'searchedCompanyData.product_service_description',
		cfFactor: 'products',
		columnType: 'humanreview',
		renderer: humanReviewRenderer,
	}),
	cfFunctions: new ColumnComparabilityDefinition({
		title: 'Functions',
		type: 'text',
		width: 200,
		description: 'Comparability status of the company',
		aiDecisionPath: 'searchedCompanyData.functionalprofilecomparability_status',
		humanDecisionPath: 'inputValues.cfFunctionalProfileHRDecision',
		aiMotivationPath: 'searchedCompanyData.functionalprofilecomparability_explanation',
		humanMotivationPath: 'inputValues.cfFunctionalProfileHRMotivation',
		aiDescriptionPath: 'searchedCompanyData.functional_profile_description',
		cfFactor: 'functions',
		columnType: 'humanreview',
		renderer: humanReviewRenderer,
	}),
	cfIndependence: new ColumnComparabilityDefinition({
		title: 'Independence',
		type: 'text',
		width: 200,
		description: 'Comparability status of the company',
		aiDecisionPath: 'searchedCompanyData.independence_status',
		humanDecisionPath: 'inputValues.cfIndependenceHRDecision',
		aiMotivationPath: 'searchedCompanyData.independence_explanation',
		humanMotivationPath: 'inputValues.cfIndependenceHRMotivation',
		aiDescriptionPath: 'searchedCompanyData.corporatestructureandaffiliations_summary',
		cfFactor: 'independence',
		columnType: 'humanreview',
		renderer: humanReviewRenderer,
	}),
};

export { comparabilityColumnDefinitionNew };


const statusColumns = {
	inputStatus: new CategoryColumn({
		title: 'Status',
		description: 'Validation status of the company entry',
		valuePath: 'INPUT',
		categorizer: InputLabelsDescriptions,
	}),
	descriptionStatus: new CategoryColumn({
		title: 'Description Status',
		description: 'Validation status of the company description',
		valuePath: 'DESCRIPTION',
		categorizer: DescriptionCategorizer,
	}),
	websiteStatus: new CategoryColumn({
		title: 'Website Status',
		description: 'Validation status of the company website',
		valuePath: 'WEBSITE',
		categorizer: WebsiteCategorizer,
	}),
	websearchStatus: new CategoryColumn({
		title: 'Web Search Status',
		description: 'Status of web search results for the company',
		valuePath: 'WEBSEARCH',
		categorizer: WebSearchCategorizer,
	}),
	acceptRejectStatus: new CategoryColumn({
		title: 'Comparability Status',
		description: 'Status of comparability analysis for the company',
		valuePath: 'ACCEPT_REJECT',
		categorizer: AcceptRejectCategorizer,
	}),
	humanReviewStatus: new CategoryColumn({
		title: 'Review Priority',
		description: 'Priority and status of human review for the company',
		valuePath: 'REVIEW_PRIORITY',
		categorizer: ReviewPriorityCategorizer,
	}),
	decisionStatus: new CategoryColumn({
		title: 'Decision',
		description: 'Final decision based on all comparability factors',
		valuePath: 'HUMAN_REVIEW',
		categorizer: HumanReviewCategorizer,
	}),
};
// Column definitions
export const companyColumns = {
	...inputColumnDefinitions,
	...statusColumns,
	...websearchColumnDefinitions,
	websiteValidation: new Column({
		title: 'Validate Website',
		type: 'text',
		width: 120,
		data: '',
		renderer: websiteValidationRenderer,
		description: 'Validate the company website',
	}),
	decision: statusColumns.decisionStatus,
};

export type ColumnConfig = {
	column: Column;
	show: 'always' | 'yes' | 'no';
	editable?: boolean;
};

export const defaultColumns: ColumnConfig[] = [
	
	{column: companyColumns.selected, show: 'yes'},
	{column: companyColumns.expandToggle, show: 'yes'},
	{column: companyColumns.inputStatus, show: 'yes'},
	{column: companyColumns.name, show: 'always'},
	{column: companyColumns.country, show: 'yes'},
	{column: companyColumns.url, show: 'yes'},
	{column: companyColumns.websiteValidation, show: 'yes'},
	// {column: companyColumns.sourceStatus, show: 'yes'},
];

export const inputColumns: ColumnConfig[] = [
	// {column: companyColumns.databaseId, show: 'always'},
	{column: companyColumns.streetAndNumber, show: 'yes'},
	{column: companyColumns.addressLine1, show: 'yes'},
	{column: companyColumns.consolidationCode, show: 'no'},
	{column: companyColumns.independenceIndicator, show: 'no'},
	{column: companyColumns.naceRev2, show: 'yes'},
	{column: companyColumns.fullOverview, show: 'yes'},
	{column: companyColumns.tradeDescriptionEnglish, show: 'yes'},
	{column: companyColumns.tradeDescriptionOriginal, show: 'no'},
	{column: companyColumns.mainActivity, show: 'yes'},
	{column: companyColumns.mainProductsAndServices, show: 'yes'},
];

// Web search specific columns
export const websearchColumns: ColumnConfig[] = [
	{column: companyColumns.searchId, show: 'yes'},
	{column: companyColumns.overallStatus, show: 'yes'},
	{column: companyColumns.websearchStatus, show: 'yes'},
	{column: companyColumns.analysisBusinessDescription, show: 'yes'},
	{column: companyColumns.analysisProductServiceDescription, show: 'yes'},
	{column: companyColumns.analysisFunctionalProfileDescription, show: 'yes'},
	{column: companyColumns.analysisCorporateStructureAndAffiliationsSummary, show: 'yes'}
];
