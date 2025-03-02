import type {InferSelectModel} from 'drizzle-orm';
import {test} from '@/db/schema';

type Test = InferSelectModel<typeof test>;

export async function createTest(testName: string): Promise<Test> {
	const response = await fetch('/api/test', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			test: testName,
		}),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || 'Failed to create test');
	}

	return data;
}

export async function updateTest(id: number, testName: string): Promise<Test> {
	const response = await fetch(`/api/test/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			test: testName,
		}),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || 'Failed to update test');
	}

	return data;
}

export async function deleteTest(id: number): Promise<Test> {
	const response = await fetch(`/api/test/${id}`, {
		method: 'DELETE',
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || 'Failed to delete test');
	}

	return data;
}
