'use client';

import * as React from 'react';
import {Button} from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
	title: string;
	description: string;
	trigger: React.ReactNode;
	onConfirm: () => Promise<void>;
}

export function ConfirmDialog({title, description, trigger, onConfirm}: ConfirmDialogProps) {
	const [open, setOpen] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);

	const handleConfirm = async () => {
		setIsLoading(true);
		try {
			await onConfirm();
			setOpen(false);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
						{isLoading ? 'Deleting...' : 'Delete'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
