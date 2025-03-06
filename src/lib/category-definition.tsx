import {Badge, badgeVariants} from '@/components/ui/badge';
import {LucideIcon, Loader2} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {VariantProps} from 'class-variance-authority';
import {CategoryColor, CategoryConfig, CategoryValue} from '@/types/category';
import {StepStatus} from '@/db/schema';
import {Button} from '@/components/ui/button';
import {getColorClass} from '@/lib/colors';
import {Company, CompanyHotCopy} from '@/lib/company/company';
type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export class CategoryDefinition {
	color: CategoryColor;
	icon: LucideIcon;
	onclick?: (company: Company | CompanyHotCopy) => void;
	tooltipText?: string;
	status?: StepStatus;
	label: string;
	passed: boolean | undefined;
	categoryKey: string;
	constructor(config: CategoryConfig) {
		this.color = config.color;
		this.icon = config.icon;
		this.status = config.status;
		this.onclick = config.onclick;
		this.tooltipText = config.onclickTooltip;
		this.label = config.label;
		this.categoryKey = config.categoryKey;
		this.passed = config.passed;
	}

	getColorClass() {
		return getColorClass(this.color, 'bg');
	}

	isDone() {
		return this.status === 'completed' || this.status === 'decision';
	}

	createIconButton(rowData: Company | CompanyHotCopy) {
		const isLoader = this.icon === Loader2;
		const iconClassName = `w-2 h-2 text-white ${isLoader ? 'animate-spin' : ''}`;
		const onClick = () => this.onclick?.(rowData);

		return (
			<Button variant="outline" size="iconSm" className={this.getColorClass()} onClick={onClick}>
				<this.icon className={iconClassName} />
			</Button>
		);
	}

	createBadge(
		value: string,
		rowData: Company | CompanyHotCopy,
		tooltipText?: string,
		filterFunction?: () => void,
		isFiltered: boolean = true,
	) {
		const variant = `${this.color}-${isFiltered ? 'emphasized' : 'default'}` as BadgeVariant;
		const isLoader = this.icon === Loader2;
		const iconClassName = `w-3 h-3 ${isLoader ? 'animate-spin' : ''}`;

		const badgeClickFunction = this.onclick ?? (() => filterFunction?.());
		const badge = (
			<Badge
				variant={variant}
				className="my-1 whitespace-nowrap cursor-pointer"
				onClick={() => badgeClickFunction(rowData)}
			>
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
