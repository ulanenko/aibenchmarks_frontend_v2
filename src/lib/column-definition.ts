import {BaseRenderer} from 'handsontable/renderers';
import {ValidatorCallback} from '@/types/handsontable';
import {StatusRenderer} from '@/lib/hot/renderers';
import {CategoryDefinition} from './category-definition';
import {StepStatus} from '@/db/schema';
import {HotColumnProps} from '@handsontable/react';
import {Check, Clock, Loader, X} from 'lucide-react';

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

export type StatusColumnConfig = Omit<ColumnConfig, 'data' | 'type' | 'renderer' | 'readOnly' | 'hotProps'> & {
	statusPath: string;
	categories?: Record<StepStatus, CategoryDefinition>;
};

const DEFAULT_CATEGORIES: Record<StepStatus, CategoryDefinition> = {
	completed: new CategoryDefinition({
		color: 'green',
		icon: Check,
	}),
	pending: new CategoryDefinition({
		color: 'gray',
		icon: Clock,
	}),
	in_progress: new CategoryDefinition({
		color: 'yellow',
		icon: Loader,
	}),
	failed: new CategoryDefinition({
		color: 'red',
		icon: X,
	}),
};

export class StatusColumn extends Column {
	categories: Record<StepStatus, CategoryDefinition>;
	constructor(config: StatusColumnConfig) {
		const fullConfig: ColumnConfig = {
			title: config.title,
			type: 'text',
			width: config.width ?? DEFAULT_WIDTH,
			data: `${config.statusPath}.value`,
			description: config.description,
			hotProps: {
				statusPath: config.statusPath,
			},
			readOnly: true,
			renderer: StatusRenderer,
			filter: config.filter ?? true,
			sort: config.sort ?? true,
		};
		super(fullConfig);
		this.categories = {...DEFAULT_CATEGORIES, ...config.categories};
	}

	toHotColumn() {
		const hotColumn = super.toHotColumn();
		hotColumn.categories = {...DEFAULT_CATEGORIES, ...this.categories};
		return hotColumn;
	}
}
