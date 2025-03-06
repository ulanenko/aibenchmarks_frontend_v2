import {BaseRenderer} from 'handsontable/renderers';
import {HotColumnProps} from '@handsontable/react';
import {ValidatorCallback} from '@/types/handsontable';
import {CategoryRenderer} from '@/components/hot/renderers';
import {Categorizer} from '@/types/category';
import {Company} from './company/company';
import {companyCategorizer} from './company/categorizer';
import {CategoryType} from '@/config/categories';

export type ColumnConfig = {
	title: string;
	type: string;
	width?: number;
	data: string;
	readOnly?: boolean;
	validator?: (value: any, callback: ValidatorCallback) => void;
	renderer?: BaseRenderer;
	description: string;
	required?: boolean;
	hotProps?: {};
	filter?: boolean;
	sort?: boolean;
	format?: (value: any) => string;
};

const DEFAULT_WIDTH = 120;

export class Column {
	title: string;
	type: string;
	width: number;
	data: string;
	readOnly?: boolean;
	validator?: (value: any, callback: ValidatorCallback) => void;
	renderer?: BaseRenderer;
	description: string;
	hotProps?: {[key: string]: any};
	required: boolean;
	filter: boolean;
	sort: boolean;
	format?: (value: any) => string;

	constructor(config: ColumnConfig) {
		this.title = config.title;
		this.type = config.type;
		this.width = config.width ?? DEFAULT_WIDTH;
		this.data = config.data;
		this.readOnly = config.readOnly;
		this.validator = config.validator;
		this.renderer = config.renderer;
		this.description = config.description;
		this.hotProps = config.hotProps;

		this.required = config.required ?? false;
		this.filter = config.filter ?? true;
		this.sort = config.sort ?? true;
		this.format = config.format;
	}

	validate(value: any): boolean {
		if (this.required && (!value || !value.toString().trim())) {
			return false;
		}
		if (this.validator) {
			let isValid = true;
			this.validator(value, (valid) => {
				isValid = valid;
			});
			return isValid;
		}
		return true;
	}

	formatValue(value: any): string {
		if (this.format) {
			return this.format(value);
		}
		return value?.toString() ?? '';
	}

	toHotColumn(): HotColumnProps {
		return {
			data: this.data,
			title: this.title,
			type: this.type,
			width: this.width,
			readOnly: this.readOnly,
			renderer: this.renderer,
			validator: this.validator,
			filter: this.filter,
			sort: this.sort,
			...this.hotProps,
		};
	}
}

export type CategoryColumnConfig = Omit<ColumnConfig, 'data' | 'type' | 'renderer' | 'readOnly' | 'hotProps'> & {
	valuePath: CategoryType;
	categorizer: Categorizer;
	// categories: StatusConfigs;
};
const CATEGORY_VALUES_PREFIX = 'categoryValues';

export class CategoryColumn extends Column {
	// categories: StatusConfigs;
	valuePath: CategoryType;
	categorizer: Categorizer;
	constructor(config: CategoryColumnConfig) {
		const fullConfig: ColumnConfig = {
			title: config.title,
			type: 'text',
			width: config.width ?? DEFAULT_WIDTH,
			data: `${CATEGORY_VALUES_PREFIX}.${config.valuePath}.label`,
			description: config.description,
			hotProps: {
				categoryValuePath: `${CATEGORY_VALUES_PREFIX}.${config.valuePath}`,
			},
			readOnly: true,
			renderer: CategoryRenderer,
			filter: config.filter ?? true,
			sort: config.sort ?? true,
		};

		super(fullConfig);
		this.valuePath = config.valuePath;
		this.categorizer = config.categorizer;
		// this.categories = getStatusConfig(config.stepId);
	}

	getCategoryKeyPath() {
		return `${CATEGORY_VALUES_PREFIX}.${this.valuePath}.categoryKey`;
	}
	getCategoryValuePath() {
		return `${CATEGORY_VALUES_PREFIX}.${this.valuePath}`;
	}

	categorize(company: Company) {
		try {
			const categoryValue = companyCategorizer(company, this.categorizer);
			company.categoryValues![this.valuePath] = categoryValue;
		} catch (error) {
			throw new Error(`Could not categorize ${this.valuePath} for ${company.name}`);
		}
	}

	toHotColumn() {
		const hotColumn = super.toHotColumn();
		// hotColumn.categories = this.categories;
		return hotColumn;
	}
}
