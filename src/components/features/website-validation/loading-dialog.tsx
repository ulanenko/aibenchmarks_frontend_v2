import React from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Loader2} from 'lucide-react';

export interface WebsiteValidationLoadingDialogProps {
	isOpen: boolean;
}

export function WebsiteValidationLoadingDialog({isOpen}: WebsiteValidationLoadingDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={() => {}}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Website Validation in Progress</DialogTitle>
					<DialogDescription>Validating company websites. This may take a moment...</DialogDescription>
				</DialogHeader>
				<div className="flex justify-center items-center py-10">
					<Loader2 className="h-10 w-10 animate-spin text-primary" />
				</div>
			</DialogContent>
		</Dialog>
	);
}
