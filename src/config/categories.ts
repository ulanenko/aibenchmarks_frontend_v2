import {CategoryDefinition} from '@/lib/category-definition';
import {CompanyHotCopy, Company} from '@/lib/company/company';
import {validateCompanyWebsite} from '@/services/client/validate-company-website';
import {PlayCircle, AlertCircle, CheckCircle, PlusCircle, Globe, FileText, X, Loader2, Search, ThumbsUp, ThumbsDown, User, Bot, Clock, BarChart, CircleHelp} from 'lucide-react';
import {analyzeCompanyService} from '@/lib/company/services/companyAnalysisService';
import {comparabilityAnalysisService} from '@/lib/company/services/comparabilityAnalysisService';
import { CompanyDetailsTab } from '@/components/features/company-details-components/company-details-dialogue';

// Function to open the Source Information Modal
const openCompanyDetailsDialogue = (company: Company | CompanyHotCopy, initialPage?: CompanyDetailsTab) => {
	if (!company.id) return;
	window.dispatchEvent(new CustomEvent('openCompanyDetailsDialogue', {
		detail: {
			companyId: company.id,
			initialPage
		}
	}));
};

// Helper functions for opening the modal to specific tabs
const openWebsiteTab = (company: Company | CompanyHotCopy) => openCompanyDetailsDialogue(company, "website");
const openDescriptionTab = (company: Company | CompanyHotCopy) => openCompanyDetailsDialogue(company, "description");
const openAnalysisTab = (company: Company | CompanyHotCopy) => openCompanyDetailsDialogue(company, "analysis");
const openSourceUsedTab = (company: Company | CompanyHotCopy) => openCompanyDetailsDialogue(company, "source-used");

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
			onclick: openWebsiteTab,
			onclickTooltip: 'View website details',
		}),
		INVALID: new CategoryDefinition({
			label: 'Invalid',
			color: 'red',
			icon: Globe,
			status: 'completed',
			categoryKey: 'WEBSITE.INVALID',
			passed: false,
			onclick: openWebsiteTab,
			onclickTooltip: 'View website issues',
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
			onclick: openDescriptionTab,
			onclickTooltip: 'Edit company description',
		}),
		VALID: new CategoryDefinition({
			label: 'Valid',
			color: 'green',
			icon: FileText,
			status: 'completed',
			categoryKey: 'DESCRIPTION.VALID',
			passed: true,
			onclick: openDescriptionTab,
			onclickTooltip: 'View company description',
		}),
	},

	INPUT: {
		NEW: new CategoryDefinition({
			label: 'New',
			color: 'green',
			icon: PlusCircle,
			status: 'not_ready',
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

	SOURCE_USED:{
		NOT_READY: new CategoryDefinition({
			label: 'Not Ready',
			color: 'gray',
			icon: AlertCircle,
			status: 'not_ready',
			categoryKey: 'SOURCE_USED.NOT_READY',
			passed: undefined,
		}),
		WEBSITE: new CategoryDefinition({
			label: 'Website',
			color: 'blue',
			icon: Globe,
			status: 'completed',
			categoryKey: 'SOURCE_USED.WEBSITE',
			passed: true,
		}),
		DESCRIPTION: new CategoryDefinition({
			label: 'Description',
			color: 'blue',
			icon: FileText,
			status: 'completed',
			categoryKey: 'SOURCE_USED.DESCRIPTION',
			passed: true,
		}),
		FAILED: new CategoryDefinition({
			label: 'Failed',
			color: 'red',
			icon: X,
			status: 'failed',
			categoryKey: 'SOURCE_USED.FAILED',
			passed: false,
		}),
	},
	WEBSEARCH: {
		NOT_READY: new CategoryDefinition({
			label: 'Not Ready',
			color: 'gray',
			icon: AlertCircle,
			status: 'not_ready',
			categoryKey: 'WEBSEARCH.NOT_READY',
			passed: undefined,
		}),
		READY: new CategoryDefinition({
			label: 'Start analysis',
			color: 'blue',
			icon: PlayCircle,
			status: 'ready',
			categoryKey: 'WEBSEARCH.READY',
			onclick: analyzeCompanyService,
			passed: undefined,
		}),
		FRONTEND_INITIALIZED: new CategoryDefinition({
			label: 'Analysis started',
			color: 'blue',
			icon: Loader2,
			status: 'in_progress',
			categoryKey: 'WEBSEARCH.FRONTEND_INITIALIZED',
			passed: undefined,
		}),
		IN_QUEUE: new CategoryDefinition({
			label: 'In queue',
			color: 'yellow',
			icon: Loader2,
			status: 'in_progress',
			categoryKey: 'WEBSEARCH.IN_QUEUE',
			passed: undefined,
		}),
		IN_PROGRESS: new CategoryDefinition({
			label: 'Searching',
			color: 'orange',
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
			label: 'Human review',
			color: 'gray',
			icon: User,
			status: 'failed',
			categoryKey: 'WEBSEARCH.FAILED',
			passed: false,
		}),
	},

	ACCEPT_REJECT: {
		NOT_READY: new CategoryDefinition({
			label: 'Not Ready',
			color: 'gray',
			icon: AlertCircle,
			status: 'not_ready',
			categoryKey: 'ACCEPT_REJECT.NOT_READY',
			passed: undefined,
		}),
		READY: new CategoryDefinition({
			label: 'Start analysis',
			color: 'blue',
			icon: PlayCircle,
			status: 'ready',
			categoryKey: 'ACCEPT_REJECT.READY',
			onclick: comparabilityAnalysisService,
			onclickTooltip: 'Start comparability analysis',
			passed: undefined,
		}),
		IN_QUEUE: new CategoryDefinition({
			label: 'In queue',
			color: 'yellow',
			icon: Loader2,
			status: 'in_progress',
			categoryKey: 'ACCEPT_REJECT.IN_QUEUE',
			passed: undefined,
		}),
		IN_PROGRESS: new CategoryDefinition({
			label: 'Evaluating',
			color: 'orange',
			icon: Loader2,
			status: 'in_progress',
			categoryKey: 'ACCEPT_REJECT.IN_PROGRESS',
			passed: undefined,
		}),
		FAILED: new CategoryDefinition({
			label: 'Human review 2',
			color: 'gray',
			icon: User,
			status: 'failed',
			categoryKey: 'ACCEPT_REJECT.FAILED',
			passed: false,
		}),
		ACCEPTED: new CategoryDefinition({
			label: 'Accepted',
			color: 'green',
			icon: Bot,
			status: 'decision',
			categoryKey: 'ACCEPT_REJECT.ACCEPTED',
			passed: true,
		}),
		REJECTED: new CategoryDefinition({
			label: 'Rejected',
			color: 'red',
			icon: Bot,
			status: 'decision',
			categoryKey: 'ACCEPT_REJECT.REJECTED',
			passed: false,
		}),
	},
	
	REVIEW_PRIORITY: {
		NOT_READY: new CategoryDefinition({
			label: 'Not Ready',
			color: 'gray',
			icon: AlertCircle,
			status: 'not_ready',
			categoryKey: 'REVIEW_PRIORITY.NOT_READY',
			passed: undefined,
		}),
		HIGH_PRIORITY: new CategoryDefinition({
			label: 'High Priority',
			color: 'red',
			icon: ThumbsUp,
			status: 'ready',
			categoryKey: 'REVIEW_PRIORITY.HIGH_PRIORITY',
			passed: undefined,
		}),
		MEDIUM_PRIORITY: new CategoryDefinition({
			label: 'Medium Priority',
			color: 'orange',
			icon: BarChart,
			status: 'ready',
			categoryKey: 'REVIEW_PRIORITY.MEDIUM_PRIORITY',
			passed: undefined,
		}),
		LOW_PRIORITY: new CategoryDefinition({
			label: 'Low Priority',
			color: 'yellow',
			icon: BarChart,
			status: 'ready',
			categoryKey: 'REVIEW_PRIORITY.LOW_PRIORITY',
			passed: undefined,
		}),
		REVIEWED: new CategoryDefinition({
			label: 'Reviewed',
			color: 'green',
			icon: CheckCircle,
			status: 'completed',
			categoryKey: 'REVIEW_PRIORITY.REVIEWED',
			passed: true,
		}),
	},
	
	HUMAN_REVIEW: {
		NO_DECISION: new CategoryDefinition({
			label: 'No decision',
			color: 'gray',
			icon: CircleHelp,
			status: 'ready',
			categoryKey: 'HUMAN_REVIEW.NO_DECISION',
			passed: undefined,
		}),
		ACCEPT_HR: new CategoryDefinition({
			label: 'Accept (HR)',
			color: 'green',
			icon: User,
			status: 'reviewed',
			categoryKey: 'HUMAN_REVIEW.ACCEPT_HR',
			passed: true,
		}),
		ACCEPT_AI: new CategoryDefinition({
			label: 'Accept (AI)',
			color: 'green',
			icon: Bot,
			status: 'decision',
			categoryKey: 'HUMAN_REVIEW.ACCEPT_AI',
			passed: true,
		}),
		REJECT_HR: new CategoryDefinition({
			label: 'Reject (HR)',
			color: 'red',
			icon: User,
			status: 'reviewed',
			categoryKey: 'HUMAN_REVIEW.REJECT_HR',
			passed: false,
		}),
		REJECT_AI: new CategoryDefinition({
			label: 'Reject (AI)',
			color: 'red',
			icon: Bot,
			status: 'decision',
			categoryKey: 'HUMAN_REVIEW.REJECT_AI',
			passed: false,
		}),
	},
	
	SITE_MATCH: {
		NOT_AVAILABLE: new CategoryDefinition({
			label: 'N/A',
			color: 'gray',
			icon: CircleHelp,
			status: 'not_ready',
			categoryKey: 'SITE_MATCH.NOT_AVAILABLE',
			passed: undefined,
			onclick: openCompanyDetailsDialogue,
			onclickTooltip: 'View source information',
		}),
		NO_MATCH: new CategoryDefinition({
			label: 'No Match',
			color: 'red',
			icon: X,
			status: 'completed',
			categoryKey: 'SITE_MATCH.NO_MATCH',
			passed: false,
		}),
		LIKELY: new CategoryDefinition({
			label: 'Likely',
			color: 'green',
			icon: CheckCircle,
			status: 'completed',
			categoryKey: 'SITE_MATCH.LIKELY',
			passed: true,
			onclick: openCompanyDetailsDialogue,
			onclickTooltip: 'View site match details',
		}),
		PARTIAL_MATCH: new CategoryDefinition({
			label: 'Partial Match',
			color: 'yellow',
			icon: AlertCircle,
			status: 'completed',
			categoryKey: 'SITE_MATCH.PARTIAL_MATCH',
			passed: undefined,
		}),
		POSSIBLY: new CategoryDefinition({
			label: 'Possibly',
			color: 'yellow',
			icon: AlertCircle,
			status: 'completed',
			categoryKey: 'SITE_MATCH.POSSIBLY',
			passed: undefined,
			onclick: openAnalysisTab,
			onclickTooltip: 'View site match details',
		}),
		NOT_LIKELY: new CategoryDefinition({
			label: 'Not Likely',
			color: 'red',
			icon: X,
			status: 'completed',
			categoryKey: 'SITE_MATCH.NOT_LIKELY',
			passed: false,
			onclick: openAnalysisTab,
			onclickTooltip: 'View site match details',
		}),
		UNCERTAIN: new CategoryDefinition({
			label: 'Uncertain',
			color: 'gray',
			icon: CircleHelp,
			status: 'completed',
			categoryKey: 'SITE_MATCH.UNCERTAIN',
			passed: undefined,
			onclick: openAnalysisTab,
			onclickTooltip: 'View site match details',
		}),
		UNKNOWN: new CategoryDefinition({
			label: 'Unknown',
			color: 'gray',
			icon: CircleHelp,
			status: 'not_ready',
			categoryKey: 'SITE_MATCH.UNKNOWN',
			passed: undefined,
			onclick: openAnalysisTab,
			onclickTooltip: 'View website analysis details',
		}),
		VALID: new CategoryDefinition({
			label: 'Valid',
			color: 'green',
			icon: ThumbsUp,
			status: 'completed',
			categoryKey: 'SITE_MATCH.VALID',
			passed: true,
			onclick: openAnalysisTab,
			onclickTooltip: 'View website analysis details',
		}),
	},
};

export type CategoryType = keyof typeof CATEGORIES;

export {CATEGORIES};

export {
	openCompanyDetailsDialogue,
	openWebsiteTab,
	openDescriptionTab,
	openAnalysisTab,
	openSourceUsedTab
};
