import {Badge, badgeVariants} from '@/components/ui/badge';
import {LucideIcon} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {VariantProps} from 'class-variance-authority';

export type COLOR_OPTIONS = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'pink' | 'gray' | 'orange';
type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export class CategoryDefinition {
	color: COLOR_OPTIONS;
	icon: LucideIcon;
	onclick?: () => void;
	tooltipText?: string;
	constructor(config: CategoryDefinitionConfig) {
		this.color = config.color;
		this.icon = config.icon;
		this.onclick = config.onclick;
		this.tooltipText = config.tooltipText;
	}

	createBadge(value: string, tooltipText?: string, filterFunction?: () => void, isFiltered: boolean = true) {
		const variant = `${this.color}-${isFiltered ? 'emphasized' : 'default'}` as BadgeVariant;

		const badgeClickFunction = this.onclick ?? (() => filterFunction?.());
		const badge = (
			<Badge variant={variant} className="my-1 whitespace-nowrap cursor-pointer" onClick={badgeClickFunction}>
				<this.icon className="w-3 h-3 " style={{marginRight: '0.35rem'}} />
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

export type CategoryDefinitionConfig = {
	color: COLOR_OPTIONS;
	icon: LucideIcon;
	onclick?: () => void;
	tooltipText?: string;
};
