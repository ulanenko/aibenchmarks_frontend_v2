import {StepStatus} from '@/db/schema';
import {CategoryDefinition} from '@/lib/category-definition';
import {LucideIcon} from 'lucide-react';
import {Company} from '@/lib/company/company';

type CategoryColor = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'pink' | 'gray' | 'orange';
type Categorizer = ((company: Company) => CategoryValue | false)[];

interface CategoryConfig {
	label: string;
	color: CategoryColor;
	categoryKey: string;
	icon: LucideIcon;
	onclick?: () => void;
	onclickTooltip?: string;
	status?: StepStatus;
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
