import {BaseRenderer} from 'handsontable/renderers';
import {ValidatorCallback} from '@/types/handsontable';
import {Column, CategoryColumn} from '@/lib/column-definition';
import {urlRenderer, websiteValidationRenderer, descriptionRenderer, expandToggleRenderer} from '@/components/hot/renderers';
import {InputLabelsDescriptions} from './categorizer/inputCategorizer';
import {DescriptionCategorizer, WebsiteCategorizer, WebSearchCategorizer} from './categorizer/sourceCategorizer';

export const inputColumnDefinitions = {
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
		data: 'dynamicInputValues.url',
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
	}),

	tradeDescriptionEnglish: new Column({
		title: 'Trade Description (English)',
		type: 'text',
		width: 200,
		data: 'inputValues.tradeDescriptionEnglish',
		description: 'English description of the company trade',
	}),
	tradeDescriptionOriginal: new Column({
		title: 'Trade Description (Original)',
		type: 'text',
		width: 200,
		data: 'inputValues.tradeDescriptionOriginal',
		description: 'Original language description of the company trade',
	}),
	mainActivity: new Column({
		title: 'Main Activity',
		type: 'text',
		width: 200,
		data: 'inputValues.mainActivity',
		description: 'Main activity of the company',
	}),
	mainProductsAndServices: new Column({
		title: 'Main Products & Services',
		type: 'text',
		width: 200,
		data: 'inputValues.mainProductsAndServices',
		description: 'Main products and services offered by the company',
	}),
};

const websearchColumnDefinitions = {
	expandToggle: new Column({
		title: 'Expand',
		type: 'text',
		width: 60,
		data: 'id', // Just using id as a data reference, doesn't matter
		renderer: expandToggleRenderer,
		readOnly: true,
		description: 'Expand or collapse description text',
	}),
	searchId: new Column({
		title: 'Search ID',
		type: 'text',
		width: 200,
		data: 'backendState.searchId',
		description: 'Search ID of the company',
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
		data: 'websiteValidation',
		renderer: websiteValidationRenderer,
		description: 'Validate the company website',
	}),

};

export type ColumnConfig = {
	column: Column;
	show: 'always' | 'yes' | 'no';
};

export const defaultColumns: ColumnConfig[] = [
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
	{column: companyColumns.expandToggle, show: 'yes'},
	{column: companyColumns.searchId, show: 'yes'},
	{column: companyColumns.overallStatus, show: 'yes'},
	{column: companyColumns.websearchStatus, show: 'yes'},
	{column: companyColumns.analysisBusinessDescription, show: 'yes'},
	{column: companyColumns.analysisProductServiceDescription, show: 'yes'},
	{column: companyColumns.analysisFunctionalProfileDescription, show: 'yes'},
	{column: companyColumns.analysisCorporateStructureAndAffiliationsSummary, show: 'yes'}
];
