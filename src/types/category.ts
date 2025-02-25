import {StepStatus} from '@/db/schema';
import {CategoryDefinition} from '@/lib/category-definition';
import {LucideIcon} from 'lucide-react';

type CategoryColor = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'pink' | 'gray' | 'orange';

interface CategoryConfig {
	label: string;
	color: CategoryColor;
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

export type {CategoryValue, CategoryConfig, CategoryColor};
