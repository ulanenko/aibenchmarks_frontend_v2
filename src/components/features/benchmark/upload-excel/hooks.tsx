import React, {useState} from 'react';
import {useToast} from '@/hooks/use-toast';
import {ModalUploadAimapper} from './modal-upload-aimapper';

/**
 * Interface for the useUpload hook return value
 */
export interface UploadUtils {
	isUploading: boolean;
	isUploadModalOpen: boolean;
	setIsUploadModalOpen: (open: boolean) => void;
	handleUploadComplete: (success: boolean) => void;
	UploadModal: () => React.ReactElement;
}

/**
 * Hook for handling Excel file upload functionality
 * Provides state management and UI components for the upload process
 */
export function useUpload(): UploadUtils {
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const {toast} = useToast();

	const handleUploadComplete = (success: boolean) => {
		if (success) {
			toast({
				title: 'Upload successful',
				description: 'Companies imported successfully',
				variant: 'default',
			});
		}
		setIsUploading(false);
	};

	const UploadModal = () => (
		<ModalUploadAimapper
			open={isUploadModalOpen}
			onOpenChange={setIsUploadModalOpen}
			onUploadComplete={handleUploadComplete}
		/>
	);

	return {
		isUploading,
		isUploadModalOpen,
		setIsUploadModalOpen,
		handleUploadComplete,
		UploadModal,
	};
}
