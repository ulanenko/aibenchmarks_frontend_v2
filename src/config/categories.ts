import {CategoryDefinition} from '@/lib/category-definition';
import {PlayCircle, AlertCircle, CheckCircle, PlusCircle, Globe, FileText, X, Loader2} from 'lucide-react';

const CATEGORIES = {
	SOURCE: {
		NOT_VALIDATED: new CategoryDefinition({
			label: 'Not Validated',
			color: 'blue',
			icon: Globe,
			status: 'ready',
			categoryKey: 'SOURCE.NOT_VALIDATED',
		}),
		VALIDATING: new CategoryDefinition({
			label: 'Validating',
			color: 'yellow',
			icon: Loader2,
			status: 'in_progress',
			categoryKey: 'SOURCE.VALIDATING',
		}),
		VALID_WEBSITE: new CategoryDefinition({
			label: 'Valid Website',
			color: 'green',
			icon: Globe,
			status: 'completed',
			categoryKey: 'SOURCE.VALID_WEBSITE',
		}),
		VALID_DESCRIPTION: new CategoryDefinition({
			label: 'Valid Description',
			color: 'green',
			icon: FileText,
			status: 'completed',
			categoryKey: 'SOURCE.VALID_DESCRIPTION',
		}),
		VALID_WEBSITE_AND_DESCRIPTION: new CategoryDefinition({
			label: 'Valid Website and Description',
			color: 'green',
			icon: CheckCircle,
			status: 'completed',
			categoryKey: 'SOURCE.VALID_WEBSITE_AND_DESCRIPTION',
		}),
		REJECT_NO_SOURCE: new CategoryDefinition({
			label: 'Reject: no source data',
			color: 'red',
			icon: X,
			status: 'decision',
			categoryKey: 'SOURCE.REJECT_NO_SOURCE',
		}),
	},
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
			color: 'blue',
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
