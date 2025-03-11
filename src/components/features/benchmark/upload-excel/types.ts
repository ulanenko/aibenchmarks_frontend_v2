// Common types for the upload Excel components

import {CreateCompanyDTO} from '@/lib/company';
import {HeaderGroup} from '@/lib/excel/excel-parser';

export type UploadStep = 'file-selection' | 'column-mapping' | 'preview';

export interface UploadState {
	file: File | null;
	sheet: string;
	database: string;
	sheets: string[];
	step: UploadStep;
	isLoading: boolean;
	isProcessing: boolean;
	error: string | null;
	columnMappings?: {[key: string]: keyof CreateCompanyDTO};
	headerGroups?: HeaderGroup[];
}

export interface StepProps {
	state: UploadState;
	updateState: (updates: Partial<UploadState>) => void;
	onNext: () => void;
	onBack?: () => void;
}
