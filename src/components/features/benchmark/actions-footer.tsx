import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {ProgressBar} from '@/components/features/benchmark/progress-bar';
import {Company} from '@/lib/company/company';
import {CategoryColumn} from '@/lib/column-definition';
import Handsontable from 'handsontable';
import {FileUpIcon, Loader2} from 'lucide-react';
import {toast} from '@/hooks/use-toast';
import {ModalUploadAimapper} from './upload-excel/modal-upload-aimapper';
import {useWebsiteValidation} from '@/components/features/website-validation';

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
	const [isValidating, setIsValidating] = useState(false);

	// Use the new validation hook with callbacks
	const {openValidationModal, ValidationDialogs, canValidate} = useWebsiteValidation({
		onValidationStart: () => setIsValidating(true),
		onValidationComplete: () => setIsValidating(false),
	});

	const handleValidationClick = () => {
		openValidationModal();
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
			// 	onCompaniesUpdate(newCompanies);
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
						<Button
							variant="outline"
							onClick={handleValidationClick}
							size="sm"
							disabled={isUploading || isSaving || isValidating || !canValidate}
						>
							{isValidating ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Validating...
								</>
							) : (
								<>Validate Companies</>
							)}
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

			<ModalUploadAimapper
				open={isUploadModalOpen}
				onOpenChange={setIsUploadModalOpen}
				onUploadComplete={handleUploadComplete}
			/>

			<ValidationDialogs />
		</>
	);
}
