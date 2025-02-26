import {useMemo, useState, useEffect} from 'react';
import {Company} from '@/lib/company/company';
import {getObjectsByCategory} from '@/lib/company/utils';
import {getValueForPath} from '@/lib/object-utils';
import {CATEGORIES} from '@/config/categories';
import {CategoryDefinition} from '@/lib/category-definition';
import {CategoryColumn} from '@/lib/column-definition';
import Handsontable from 'handsontable';
import {createHOTFilter} from '@/components/hot/renderers/category-renderer';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';

interface ProgressBarProps {
	companies: Company[];
	categoryColumn: CategoryColumn;
	className?: string;
	hotInstance?: Handsontable;
}

export function ProgressBar({companies, categoryColumn, hotInstance}: ProgressBarProps) {
	// Force re-render when filters change
	const [filterVersion, setFilterVersion] = useState(0);

	// Listen for filter changes in Handsontable
	useEffect(() => {
		if (!hotInstance) return;
		// Set up event listeners for filter changes
		const afterFilter = () => {
			setFilterVersion((prev) => prev + 1);
		};
		hotInstance.addHook('afterFilter', afterFilter);
		// Clean up event listeners
		return () => {
			hotInstance?.removeHook('afterFilter', afterFilter);
		};
	}, [hotInstance]);

	const segments = useMemo(() => {
		if (companies.length === 0) return [];
		const companiesByCategory = getObjectsByCategory(companies, categoryColumn.getCategoryKeyPath());
		const categoryKeys = Object.keys(companiesByCategory);
		const total = companies.length;
		const categories = categoryKeys.map((categoryKey) => {
			const category = getValueForPath(CATEGORIES, categoryKey) as CategoryDefinition;
			if (!category) {
				throw new Error(`Category not found for key: ${categoryKey}`);
			}
			const filterApplied = hotInstance && getValueForPath(hotInstance, `categoryFilters.${categoryKey}`) === true;
			const count = companiesByCategory[categoryKey].length;
			return {
				key: category.label,
				label: `${category.label} (${count})`,
				color: category.getColorClass(),
				width: (count / total) * 100,
				count,
				categoryKey,
				category,
				filterApplied,
			};
		});
		return categories;
	}, [companies, categoryColumn, filterVersion]);

	const handleFilterClick = (segment: (typeof segments)[0]) => {
		if (!hotInstance) return;
		const filterFn = createHOTFilter(hotInstance, categoryColumn, segment.category);
		filterFn();
	};

	if (companies.length === 0) {
		return <div className="flex items-center gap-2 text-sm text-muted-foreground">No companies added yet</div>;
	}

	return (
		<TooltipProvider>
			<div className="space-y-2 min-w-0">
				<div className="text-sm text-muted-foreground whitespace-nowrap">
					PROGRESS (TOTAL COMPANIES: {companies.length})
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<div className="flex items-center gap-4 text-sm flex-wrap">
						{segments.map((segment) => {
							return (
								<Tooltip key={segment.key}>
									<TooltipTrigger asChild>
										<div
											className={`flex items-center gap-1 whitespace-nowrap cursor-pointer ${
												segment.filterApplied ? 'ring-2 ring-offset-1 ring-primary rounded-md px-1' : ''
											}`}
											onClick={() => handleFilterClick(segment)}
										>
											<div className={`h-3 w-3 rounded-full ${segment.color}`} />
											<span>{segment.label}</span>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p>
											Click to {segment.filterApplied ? 'clear filter' : 'filter'} by {segment.category.label}
										</p>
									</TooltipContent>
								</Tooltip>
							);
						})}
					</div>
				</div>
				<div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden flex-shrink">
					<div className="flex h-full">
						{segments.map((segment) => {
							return (
								<Tooltip key={segment.key}>
									<TooltipTrigger asChild>
										<div
											className={`h-full ${segment.color} transition-all duration-300 cursor-pointer ${
												segment.filterApplied ? 'ring-1 ring-primary' : ''
											}`}
											style={{width: `${segment.width}%`}}
											onClick={() => handleFilterClick(segment)}
										/>
									</TooltipTrigger>
									<TooltipContent>
										<p>
											{segment.label}: {segment.count} companies
										</p>
										<p>Click to {segment.filterApplied ? 'clear filter' : 'filter'}</p>
									</TooltipContent>
								</Tooltip>
							);
						})}
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
}
