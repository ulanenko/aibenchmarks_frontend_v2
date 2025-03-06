import {CategoryColor} from '@/types/category';

const colorMap: Record<CategoryColor, string> = {
	green: 'emerald-500',
	red: 'rose-500',
	yellow: 'amber-500',
	blue: 'blue-500',
	purple: 'purple-500',
	pink: 'pink-500',
	gray: 'slate-500',
	orange: 'orange-500',
};

const elementTypes = ['bg', 'text', 'border'] as const;
type ElementType = (typeof elementTypes)[number];

export const getColorClass = (color: CategoryColor, element: ElementType) => {
	const colorClass = colorMap[color];
	return `${element}-${colorClass}`;
};
