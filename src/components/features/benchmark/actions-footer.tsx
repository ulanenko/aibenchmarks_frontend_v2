import {Button} from '@/components/ui/button';
import {ProgressBar} from '@/components/features/benchmark/progress-bar';
import {Company} from '@/lib/company/company';
import {CategoryColumn} from '@/lib/column-definition';
import Handsontable from 'handsontable';
import {useState} from 'react';
import {UploadExcelModal} from './upload-excel/upload-excel-modal';
import {FileUpIcon, Loader2} from 'lucide-react';
import {toast} from '@/hooks/use-toast';

interface ActionsFooterProps {
	onSave: () => void;
	onNext: () => void;
	isSaving: boolean;
	companies: Company[];
	categoryColumn: CategoryColumn;
	className?: string;
	hotInstance?: Handsontable;
	onCompaniesUpdate?: (companies: Company[]) => void;
}

export function ActionsFooter({
	onSave,
	onNext,
	isSaving,
	companies,
	categoryColumn,
	className = '',
	hotInstance,
	onCompaniesUpdate,
}: ActionsFooterProps) {
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	const onValidate = () => {
		console.log('validate');
	};

	const handleUploadComplete = (success: boolean) => {
		if (success) {
			toast({
				title: 'Upload successful',
				description: 'Companies imported successfully',
				variant: 'default',
			});

			// In a real implementation, we would update the companies here
			// if (onCompaniesUpdate) {
			//   onCompaniesUpdate(newCompanies);
			// }
		}
		setIsUploading(false);
	};

	return (
		<>
			<div className={`bg-background py-4 px-4 ${className}`}>
				<div className="flex items-center justify-between gap-4">
					<div className="flex-grow">
						<ProgressBar companies={companies} categoryColumn={categoryColumn} hotInstance={hotInstance} />
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							onClick={() => setIsUploadModalOpen(true)}
							size="sm"
							disabled={isUploading || isSaving}
						>
							{isUploading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Uploading...
								</>
							) : (
								<>
									<FileUpIcon className="h-4 w-4 mr-2" />
									Upload Excel
								</>
							)}
						</Button>
						<Button variant="outline" onClick={onValidate} size="sm" disabled={isUploading || isSaving}>
							Validate companies
						</Button>
						<Button variant="outline" onClick={onSave} disabled={isSaving || isUploading} size="sm">
							{isSaving ? 'Saving...' : 'Save Changes'}
						</Button>
						<Button onClick={onNext} size="sm" disabled={isUploading}>
							Next Step →
						</Button>
					</div>
				</div>
			</div>

			<UploadExcelModal
				open={isUploadModalOpen}
				onOpenChange={setIsUploadModalOpen}
				onUploadComplete={handleUploadComplete}
			/>
		</>
	);
}
