import {Button} from '@/components/ui/button';
import {ProgressBar} from '@/components/features/benchmark/progress-bar';
import {Company} from '@/lib/company/company';
import {CategoryColumn} from '@/lib/column-definition';
import Handsontable from 'handsontable';

interface ActionsFooterProps {
	onSave: () => void;
	onNext: () => void;
	isSaving: boolean;
	companies: Company[];
	categoryColumn: CategoryColumn;
	className?: string;
	hotInstance?: Handsontable;
}

export function ActionsFooter({
	onSave,
	onNext,
	isSaving,
	companies,
	categoryColumn,
	className = '',
	hotInstance,
}: ActionsFooterProps) {
	const onValidate = () => {
		console.log('validate');
	};
	return (
		<div className={`bg-background py-4 px-4 ${className}`}>
			<div className="flex items-center justify-between gap-4">
				<div className="flex-grow">
					<ProgressBar companies={companies} categoryColumn={categoryColumn} hotInstance={hotInstance} />
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={onValidate} size="sm">
						Validate companies
					</Button>
					<Button variant="outline" onClick={onSave} disabled={isSaving} size="sm">
						{isSaving ? 'Saving...' : 'Save Changes'}
					</Button>
					<Button onClick={onNext} size="sm">
						Next Step →
					</Button>
				</div>
			</div>
		</div>
	);
}
