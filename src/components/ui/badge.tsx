import * as React from 'react';
import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '@/lib/utils';

const badgeVariants = cva(
	'inline-flex items-center rounded-full border px-2 py-0.25 text-[0.7rem] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	{
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
				secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
				outline: 'text-foreground',
				// Emphasized variants
				'green-emphasized': 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600',
				'red-emphasized': 'bg-rose-600 text-white hover:bg-rose-700 border-rose-600',
				'yellow-emphasized': 'bg-amber-500 text-slate-900 hover:bg-amber-600 border-amber-500',
				'blue-emphasized': 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600',
				'purple-emphasized': 'bg-purple-600 text-white hover:bg-purple-700 border-purple-600',
				'pink-emphasized': 'bg-pink-600 text-white hover:bg-pink-700 border-pink-600',
				'gray-emphasized': 'bg-slate-600 text-white hover:bg-slate-700 border-slate-600',
				'orange-emphasized': 'bg-orange-500 text-white hover:bg-orange-600 border-orange-500',
				// Default variants
				'green-default': 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
				'red-default': 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200',
				'yellow-default': 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
				'blue-default': 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
				'purple-default': 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
				'pink-default': 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200',
				'gray-default': 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200',
				'orange-default': 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({className, variant, ...props}: BadgeProps) {
	return <div className={cn(badgeVariants({variant}), className)} {...props} />;
}

export {Badge, badgeVariants};
