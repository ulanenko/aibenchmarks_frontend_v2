'use client';

import {HelpSheet} from '@/components/layout/helpsheet/help-sheet';

interface PageHeaderProps {
	title: string;
	description?: string;
	helpContent?: React.ReactNode;
}

export function PageHeader({title, description, helpContent}: PageHeaderProps) {
	return (
		<div className="flex justify-between items-center w-full">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
				{description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
			</div>
			{helpContent && <HelpSheet title={title}>{helpContent}</HelpSheet>}
		</div>
	);
}
