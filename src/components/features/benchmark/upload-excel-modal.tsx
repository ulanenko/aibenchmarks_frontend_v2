'use client';

import * as React from 'react';
import {UploadExcelModal as NewUploadExcelModal} from './upload-excel/upload-excel-modal';

// This file is kept for backward compatibility
// It redirects to the new implementation in the upload-excel folder

interface UploadExcelModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUploadComplete?: (success: boolean) => void;
}

export function UploadExcelModal({open, onOpenChange, onUploadComplete}: UploadExcelModalProps) {
	const handleUploadComplete = (success: boolean) => {
		if (success && onUploadComplete) {
			onUploadComplete(success);
		}
	};

	return <NewUploadExcelModal open={open} onOpenChange={onOpenChange} onUploadComplete={handleUploadComplete} />;
}
