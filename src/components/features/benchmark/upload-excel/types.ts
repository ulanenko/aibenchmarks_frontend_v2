// Common types for the upload Excel components

export type UploadStep = 'file-selection' | 'column-mapping' | 'preview';

export interface ExtractedTableData {
	headers: string[];
	content: any[][];
	jsonData?: Record<string, any>[];
}

export interface UploadState {
	file: File | null;
	sheet: string;
	database: string;
	sheets: string[];
	step: UploadStep;
	isLoading: boolean;
	isProcessing: boolean;
	error: string | null;
	columnMappings?: {[key: string]: string};
	extractedData?: ExtractedTableData;
}

export interface StepProps {
	state: UploadState;
	updateState: (updates: Partial<UploadState>) => void;
	onNext: () => void;
	onBack?: () => void;
}
