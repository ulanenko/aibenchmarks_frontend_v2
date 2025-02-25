import {Button} from '@/components/ui/button';
import {ProgressBar} from '@/components/features/benchmark/progress-bar';
import {Company} from '@/lib/company/company';

interface ActionsFooterProps {
	onSave: () => void;
	onNext: () => void;
	isSaving: boolean;
	companies: Company[];
	categoryPath: string;
	className?: string;
}

export function ActionsFooter({onSave, onNext, isSaving, companies, categoryPath, className = ''}: ActionsFooterProps) {
	const onValidate = () => {
		console.log('validate');
	};
	return (
		<div className={`bg-background py-4 px-4 ${className}`}>
			<div className="flex items-center justify-between gap-4">
				<div className="flex-grow">
					<ProgressBar companies={companies} categoryPath={categoryPath} />
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
