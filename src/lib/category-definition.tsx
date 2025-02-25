import {Badge, badgeVariants} from '@/components/ui/badge';
import {LucideIcon} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {VariantProps} from 'class-variance-authority';
import {CategoryColor, CategoryConfig} from '@/types/category';
import {StepStatus} from '@/db/schema';
type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

const colorMap: Record<CategoryColor, string> = {
	green: 'bg-green-500',
	red: 'bg-red-500',
	yellow: 'bg-yellow-500',
	blue: 'bg-blue-500',
	purple: 'bg-purple-500',
	pink: 'bg-pink-500',
	gray: 'bg-gray-500',
	orange: 'bg-orange-500',
};

export class CategoryDefinition {
	color: CategoryColor;
	icon: LucideIcon;
	onclick?: () => void;
	tooltipText?: string;
	status?: StepStatus;
	label: string;
	categoryKey: string;
	constructor(config: CategoryConfig) {
		this.color = config.color;
		this.icon = config.icon;
		this.status = config.status;
		this.onclick = config.onclick;
		this.tooltipText = config.onclickTooltip;
		this.label = config.label;
		this.categoryKey = config.categoryKey;
	}

	getColorClass() {
		return colorMap[this.color];
	}

	createBadge(value: string, tooltipText?: string, filterFunction?: () => void, isFiltered: boolean = true) {
		const variant = `${this.color}-${isFiltered ? 'emphasized' : 'default'}` as BadgeVariant;

		const badgeClickFunction = this.onclick ?? (() => filterFunction?.());
		const badge = (
			<Badge variant={variant} className="my-1 whitespace-nowrap cursor-pointer" onClick={badgeClickFunction}>
				{this.icon && <this.icon className="w-3 h-3 " style={{marginRight: '0.35rem'}} />}
				{value}
			</Badge>
		);

		if (tooltipText) {
			return (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>{badge}</TooltipTrigger>
						<TooltipContent>{tooltipText}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		}

		return badge;
	}
}

// export type CategoryDefinitionConfig = {
// 	color: COLOR_OPTIONS;
// 	icon: LucideIcon;
// 	onclick?: () => void;
// 	tooltipText?: string;
// };
