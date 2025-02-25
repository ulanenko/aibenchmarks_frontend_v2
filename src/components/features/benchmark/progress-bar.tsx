import {useMemo} from 'react';
import {Company} from '@/lib/company/company';
import {getObjectsByCategory} from '@/lib/company/utils';
import {getValueForPath} from '@/lib/object-utils';
import {CATEGORIES} from '@/config/categories';
import {CategoryColor} from '@/types/category';
import {CategoryDefinition} from '@/lib/category-definition';
import {CategoryColumn} from '@/lib/column-definition';
interface ProgressBarProps {
	companies: Company[];
	categoryColumn: CategoryColumn;
	className?: string;
}

export function ProgressBar({companies, categoryColumn}: ProgressBarProps) {
	const segments = useMemo(() => {
		if (companies.length === 0) return [];
		const companiesByCategory = getObjectsByCategory(companies, categoryColumn.getCategoryKey());
		const categoryKeys = Object.keys(companiesByCategory);
		const total = companies.length;
		const categories = categoryKeys.map((categoryKey) => {
			const category = getValueForPath(CATEGORIES, categoryKey) as CategoryDefinition;
			if (!category) {
				throw new Error(`Category not found for key: ${categoryKey}`);
			}
			const count = companiesByCategory[categoryKey].length;
			return {
				key: category.label,
				label: `${category.label} (${count})`,
				color: category.getColorClass(),
				width: (count / total) * 100,
				count,
			};
		});
		return categories;
	}, [companies, categoryColumn]);

	if (companies.length === 0) {
		return <div className="flex items-center gap-2 text-sm text-muted-foreground">No companies added yet</div>;
	}

	return (
		<div className="space-y-2 min-w-0">
			<div className="text-sm text-muted-foreground whitespace-nowrap">
				PROGRESS (TOTAL COMPANIES: {companies.length})
			</div>
			<div className="flex items-center gap-2 flex-wrap">
				<div className="flex items-center gap-4 text-sm flex-wrap">
					{segments.map((segment) => (
						<div key={segment.key} className="flex items-center gap-1 whitespace-nowrap">
							<div className={`h-3 w-3 rounded-full ${segment.color}`} />
							<span>{segment.label}</span>
						</div>
					))}
				</div>
			</div>
			<div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden flex-shrink">
				<div className="flex h-full">
					{segments.map((segment) => (
						<div
							key={segment.key}
							className={`h-full ${segment.color} transition-all duration-300`}
							style={{width: `${segment.width}%`}}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
