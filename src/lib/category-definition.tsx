import {Badge, badgeVariants} from '@/components/ui/badge';
import {LucideIcon, Loader2} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {VariantProps} from 'class-variance-authority';
import {CategoryColor, CategoryConfig, CategoryValue} from '@/types/category';
import {StepStatus} from '@/db/schema';
import {Button} from '@/components/ui/button';
type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

const colorMap: Record<CategoryColor, string> = {
	green: 'bg-emerald-500',
	red: 'bg-rose-500',
	yellow: 'bg-amber-500',
	blue: 'bg-blue-500',
	purple: 'bg-purple-500',
	pink: 'bg-pink-500',
	gray: 'bg-slate-500',
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

	createIconButton(onClick: () => void) {
		const isLoader = this.icon === Loader2;
		const iconClassName = `w-2 h-2 text-white ${isLoader ? 'animate-spin' : ''}`;

		return (
			<Button variant="outline" size="iconSm" className={this.getColorClass()} onClick={onClick}>
				<this.icon className={iconClassName} />
			</Button>
		);
	}

	createBadge(value: string, tooltipText?: string, filterFunction?: () => void, isFiltered: boolean = true) {
		const variant = `${this.color}-${isFiltered ? 'emphasized' : 'default'}` as BadgeVariant;
		const isLoader = this.icon === Loader2;
		const iconClassName = `w-3 h-3 ${isLoader ? 'animate-spin' : ''}`;

		const badgeClickFunction = this.onclick ?? (() => filterFunction?.());
		const badge = (
			<Badge variant={variant} className="my-1 whitespace-nowrap cursor-pointer" onClick={badgeClickFunction}>
				{this.icon && <this.icon className={iconClassName} style={{marginRight: '0.35rem'}} />}
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

	toCategoryValue({label, description}: {label?: string; description?: string} = {}): CategoryValue {
		return {
			category: this,
			categoryKey: this.categoryKey,
			label: label ?? this.label,
			description: description ?? this.tooltipText,
		};
	}
}

// export type CategoryDefinitionConfig = {
// 	color: COLOR_OPTIONS;
// 	icon: LucideIcon;
// 	onclick?: () => void;
// 	tooltipText?: string;
// };
