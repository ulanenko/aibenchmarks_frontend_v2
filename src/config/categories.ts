import {CategoryDefinition} from '@/lib/category-definition';
import {CompanyHotCopy} from '@/lib/company/company';
import {validateCompanyWebsite} from '@/services/client/validate-company-website';
import {PlayCircle, AlertCircle, CheckCircle, PlusCircle, Globe, FileText, X, Loader2, Search} from 'lucide-react';

const CATEGORIES = {
	WEBSITE: {
		NOT_READY: new CategoryDefinition({
			label: 'Not Ready',
			color: 'gray',
			icon: Globe,
			status: 'not_ready',
			categoryKey: 'WEBSITE.NOT_READY',
			passed: undefined,
		}),
		NOT_VALIDATED: new CategoryDefinition({
			label: 'Not Validated',
			color: 'blue',
			icon: Globe,
			status: 'ready',
			onclick: validateCompanyWebsite,
			categoryKey: 'WEBSITE.NOT_VALIDATED',
			passed: undefined,
		}),
		VALIDATING: new CategoryDefinition({
			label: 'Validating',
			color: 'yellow',
			icon: Loader2,
			status: 'in_progress',
			categoryKey: 'WEBSITE.VALIDATING',
			passed: undefined,
		}),
		VALID: new CategoryDefinition({
			label: 'Valid',
			color: 'green',
			icon: Globe,
			status: 'completed',
			categoryKey: 'WEBSITE.VALID',
			passed: true,
		}),
		INVALID: new CategoryDefinition({
			label: 'Invalid',
			color: 'red',
			icon: Globe,
			status: 'completed',
			categoryKey: 'WEBSITE.INVALID',
			passed: false,
		}),
	},
	DESCRIPTION: {
		INVALID: new CategoryDefinition({
			label: 'Insufficient',
			color: 'red',
			icon: FileText,
			status: 'completed',
			categoryKey: 'DESCRIPTION.INVALID',
			passed: false,
			onclick: (company) => {
				// We'll implement the modal opening logic in a separate hook
				window.dispatchEvent(new CustomEvent('openDescriptionModal', {detail: {company}}));
			},
			onclickTooltip: 'Edit company description',
		}),
		VALID: new CategoryDefinition({
			label: 'Valid',
			color: 'green',
			icon: FileText,
			status: 'completed',
			categoryKey: 'DESCRIPTION.VALID',
			passed: true,
			onclick: (company) => {
				// We'll implement the modal opening logic in a separate hook
				window.dispatchEvent(new CustomEvent('openDescriptionModal', {detail: {company}}));
			},
			onclickTooltip: 'View company description',
		}),
	},

	INPUT: {
		NEW: new CategoryDefinition({
			label: 'New',
			color: 'green',
			icon: PlusCircle,
			status: 'not_started',
			categoryKey: 'INPUT.NEW',
			passed: undefined,
		}),
		INPUT_REQUIRED: new CategoryDefinition({
			label: 'Input Required',
			color: 'yellow',
			icon: AlertCircle,
			status: 'input_required',
			categoryKey: 'INPUT.INPUT_REQUIRED',
			passed: undefined,
		}),
		WEBSITE_INVALID: new CategoryDefinition({
			label: 'Website Invalid',
			color: 'yellow',
			icon: AlertCircle,
			status: 'input_required',
			categoryKey: 'INPUT.WEBSITE_INVALID',
			passed: undefined,
		}),
		READY: new CategoryDefinition({
			label: 'Validate',
			color: 'blue',
			icon: PlayCircle,
			status: 'ready',
			onclick: validateCompanyWebsite,
			categoryKey: 'INPUT.READY',
			passed: undefined,
		}),
		IN_PROGRESS: new CategoryDefinition({
			label: 'Validating',
			color: 'yellow',
			icon: Loader2,
			status: 'in_progress',
			categoryKey: 'INPUT.IN_PROGRESS',
			passed: undefined,
		}),
		REJECT_NO_SOURCE: new CategoryDefinition({
			label: 'Reject: no source data',
			color: 'red',
			icon: X,
			status: 'decision',
			categoryKey: 'INPUT.REJECT_NO_SOURCE',
			passed: false,
		}),
		COMPLETED: new CategoryDefinition({
			label: 'Validated',
			color: 'green',
			icon: CheckCircle,
			status: 'completed',
			categoryKey: 'INPUT.COMPLETED',
			passed: true,
		}),
	},
	WEBSEARCH: {
		NOT_STARTED: new CategoryDefinition({
			label: 'Not Started',
			color: 'gray',
			icon: Search,
			status: 'not_started',
			categoryKey: 'WEBSEARCH.NOT_STARTED',
			passed: undefined,
		}),
		IN_PROGRESS: new CategoryDefinition({
			label: 'Searching',
			color: 'yellow',
			icon: Loader2,
			status: 'in_progress',
			categoryKey: 'WEBSEARCH.IN_PROGRESS',
			passed: undefined,
		}),
		COMPLETED: new CategoryDefinition({
			label: 'Completed',
			color: 'green',
			icon: CheckCircle,
			status: 'completed',
			categoryKey: 'WEBSEARCH.COMPLETED',
			passed: true,
		}),
		FAILED: new CategoryDefinition({
			label: 'Failed',
			color: 'red',
			icon: X,
			status: 'completed',
			categoryKey: 'WEBSEARCH.FAILED',
			passed: false,
		}),
	},
};

export type CategoryType = keyof typeof CATEGORIES;

export {CATEGORIES};
