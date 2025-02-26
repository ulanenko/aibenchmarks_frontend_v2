import {BaseRenderer} from 'handsontable/renderers';
import {ValidatorCallback} from '@/types/handsontable';
import {Column, CategoryColumn} from '@/lib/column-definition';
import {urlRenderer} from '@/components/hot/renderers';
import {InputLabelsDescriptions} from './categorizer/inputCategorizer';

// Column definitions
export const companyColumns = {
	inputStatus: new CategoryColumn({
		title: 'Status',
		description: 'Validation status of the company entry',
		valuePath: 'input',
		categorizer: InputLabelsDescriptions,
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
		data: 'inputValues.url',
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

export type ColumnConfig = {
	column: Column;
	show: 'always' | 'yes' | 'no';
};

export const defaultColumns: ColumnConfig[] = [
	{column: companyColumns.inputStatus, show: 'yes'},
	{column: companyColumns.name, show: 'always'},
	{column: companyColumns.country, show: 'yes'},
	{column: companyColumns.url, show: 'yes'},
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
