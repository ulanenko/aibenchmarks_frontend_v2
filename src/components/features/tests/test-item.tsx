'use client';

import * as React from 'react';
import {Button} from '@/components/ui/button';
import {TestFormDialog} from './test-form-dialog';
import {ConfirmDialog} from '@/components/layout/dialogues/confirm-dialog';
import {useTestStore} from '@/stores/use-test-store';
import {Pencil, Trash2} from 'lucide-react';
import type {InferSelectModel} from 'drizzle-orm';
import {test} from '@/db/schema';

type Test = InferSelectModel<typeof test>;

interface TestItemProps {
	test: Test;
}

export function TestItem({test}: TestItemProps) {
	const {deleteTest} = useTestStore();

	return (
		<div className="p-3 bg-muted rounded-md flex items-center justify-between group">
			<span>{test.test}</span>
			<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<TestFormDialog
					mode="edit"
					test={test}
					trigger={
						<Button variant="ghost" size="sm">
							<Pencil className="h-4 w-4 mr-2" />
							Edit
						</Button>
					}
				/>
				<ConfirmDialog
					title="Delete Test"
					description="Are you sure you want to delete this test? This action cannot be undone."
					trigger={
						<Button variant="ghost" size="sm">
							<Trash2 className="h-4 w-4 mr-2" />
							Delete
						</Button>
					}
					onConfirm={() => deleteTest(test.id)}
				/>
			</div>
		</div>
	);
}
