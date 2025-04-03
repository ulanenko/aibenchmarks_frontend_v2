import {StepStatus} from '@/db/schema';
import {CategoryDefinition} from '@/lib/category-definition';
import {LucideIcon} from 'lucide-react';
import {Company, CompanyHotCopy} from '@/lib/company/company';

type CategoryColor = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'pink' | 'gray' | 'orange';
type Categorizer = ((company: Company) => CategoryValue | false)[];

interface CategoryConfig {
	label: string;
	color: CategoryColor;
	categoryKey: string;
	icon: LucideIcon;
	onclick?: (company: Company | CompanyHotCopy) => void;
	onclickTooltip?: string;
	secondIcon?: LucideIcon;
	status?: StepStatus;
	// if passed is true or false, it can proceed to the next step
	// if undefined, it means that the category is not yet ready to proceed
	// if it's true, it means that the company has not yet been rejected
	passed: boolean | undefined;
}

// this value is assigned to companies and is used by the column renderer
// it is assigned by the categorizer function
type CategoryValue = {
	category: CategoryDefinition;
	label: string;
	categoryKey: string;
	description?: string;
};

export type {CategoryValue, CategoryConfig, CategoryColor, Categorizer};
