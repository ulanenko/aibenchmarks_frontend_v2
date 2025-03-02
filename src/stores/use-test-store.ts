import {create} from 'zustand';
import type {InferSelectModel} from 'drizzle-orm';
import {test} from '@/db/schema';
import {toast} from '@/hooks/use-toast';
import * as testService from '@/services/client/tests';

type Test = InferSelectModel<typeof test>;

interface TestStore {
	tests: Test[];
	isLoading: boolean;
	setTests: (tests: Test[]) => void;
	addTest: (testName: string) => Promise<void>;
	editTest: (id: number, testName: string) => Promise<void>;
	deleteTest: (id: number) => Promise<void>;
}

export const useTestStore = create<TestStore>((set, get) => ({
	tests: [],
	isLoading: false,
	setTests: (tests) => set({tests}),
	addTest: async (testName) => {
		set({isLoading: true});
		try {
			const newTest = await testService.createTest(testName);
			set((state) => ({
				tests: [...state.tests, newTest],
			}));

			toast({
				title: 'Success',
				description: 'Test created successfully',
			});
		} catch (error) {
			console.error('Error creating test:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to create test',
			});
		} finally {
			set({isLoading: false});
		}
	},
	editTest: async (id: number, testName: string) => {
		set({isLoading: true});
		try {
			const updatedTest = await testService.updateTest(id, testName);
			set((state) => ({
				tests: state.tests.map((test) => (test.id === id ? updatedTest : test)),
			}));

			toast({
				title: 'Success',
				description: 'Test updated successfully',
			});
		} catch (error) {
			console.error('Error updating test:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to update test',
			});
		} finally {
			set({isLoading: false});
		}
	},
	deleteTest: async (id: number) => {
		set({isLoading: true});
		try {
			await testService.deleteTest(id);
			set((state) => ({
				tests: state.tests.filter((test) => test.id !== id),
			}));

			toast({
				title: 'Success',
				description: 'Test deleted successfully',
			});
		} catch (error) {
			console.error('Error deleting test:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to delete test',
			});
		} finally {
			set({isLoading: false});
		}
	},
}));
