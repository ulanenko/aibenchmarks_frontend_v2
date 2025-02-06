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
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useTestStore} from '@/stores/use-test-store';
import type {InferSelectModel} from 'drizzle-orm';
import {test} from '@/db/schema';

type Test = InferSelectModel<typeof test>;

interface TestFormDialogProps {
	mode: 'create' | 'edit';
	test?: Test;
	trigger: React.ReactNode;
}

export function TestFormDialog({mode, test: initialTest, trigger}: TestFormDialogProps) {
	const [testName, setTestName] = React.useState(initialTest?.test || '');
	const [open, setOpen] = React.useState(false);
	const {addTest, editTest, isLoading} = useTestStore();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (mode === 'create') {
			await addTest(testName);
		} else if (initialTest?.id) {
			await editTest(initialTest.id, testName);
		}
		setTestName('');
		setOpen(false);
	};

	const title = mode === 'create' ? 'Create Test' : 'Edit Test';
	const description = mode === 'create' ? 'Add a new test to track AI model performance.' : 'Edit an existing test.';
	const buttonText = mode === 'create' ? 'Create' : 'Save';

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>
				<form onSubmit={onSubmit}>
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
						<DialogDescription>{description}</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="test">Test Name</Label>
							<Input
								id="test"
								value={testName}
								onChange={(e) => setTestName(e.target.value)}
								placeholder="Enter test name"
								disabled={isLoading}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? 'Saving...' : buttonText}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
