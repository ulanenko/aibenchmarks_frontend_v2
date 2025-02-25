import {CategoryDefinition} from '@/lib/category-definition';
import {PlayCircle, AlertCircle, CheckCircle, PlusCircle} from 'lucide-react';

const CATEGORIES = {
	INPUT: {
		NEW: new CategoryDefinition({
			label: 'New',
			color: 'green',
			icon: PlusCircle,
			status: 'not_started',
			categoryKey: 'INPUT.NEW',
		}),
		INPUT_REQUIRED: new CategoryDefinition({
			label: 'Input Required',
			color: 'yellow',
			icon: AlertCircle,
			status: 'input_required',
			categoryKey: 'INPUT.INPUT_REQUIRED',
		}),
		WEBSITE_INVALID: new CategoryDefinition({
			label: 'Website Invalid',
			color: 'yellow',
			icon: AlertCircle,
			status: 'input_required',
			categoryKey: 'INPUT.WEBSITE_INVALID',
		}),
		READY: new CategoryDefinition({
			label: 'Validate',
			color: 'red',
			icon: PlayCircle,
			status: 'ready',
			categoryKey: 'INPUT.READY',
		}),
		COMPLETED: new CategoryDefinition({
			label: 'Validated',
			color: 'green',
			icon: CheckCircle,
			status: 'completed',
			categoryKey: 'INPUT.COMPLETED',
		}),
	},
};

export type CategoryType = keyof typeof CATEGORIES;

export {CATEGORIES};
