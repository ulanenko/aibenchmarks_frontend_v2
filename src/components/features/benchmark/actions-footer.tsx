import {ReactNode} from 'react';
import {ProgressBar} from '@/components/features/benchmark/progress-bar';
import {Company} from '@/lib/company/company';
import {CategoryColumn} from '@/lib/column-definition';
import Handsontable from 'handsontable';

/**
 * Component that provides a footer with progress tracking and action buttons
 */
interface ActionsFooterProps {
	companies: Company[];
	categoryColumn: CategoryColumn;
	hotInstance?: Handsontable;
	children?: ReactNode;
	className?: string;
}

export function ActionsFooter({companies, categoryColumn, className = '', hotInstance, children}: ActionsFooterProps) {
	return (
		<div className={`bg-background py-4 px-4 ${className} border-t flex-none`}>
			<div className="flex items-center justify-between gap-4">
				<div className="flex-grow">
					<ProgressBar companies={companies} categoryColumn={categoryColumn} hotInstance={hotInstance} />
				</div>
				<div className="flex items-center gap-2">{children}</div>
			</div>
		</div>
	);
}
