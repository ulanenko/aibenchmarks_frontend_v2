import {create} from 'zustand';
import {Benchmark, BenchmarkSchemaType} from '@/lib/benchmark/benchmark';
import {BenchmarkDTO, CreateBenchmarkDTO, UpdateBenchmarkDTO} from '@/lib/benchmark/type';
import {toast} from '@/hooks/use-toast';
import * as benchmarkService from '@/services/api/benchmarks';

interface BenchmarkListStore {
	benchmarks: Benchmark[];
	isLoading: boolean;
	setBenchmarks: (benchmarks: Benchmark[]) => void;
	loadBenchmarks: () => Promise<void>;
	addBenchmark: (data: CreateBenchmarkDTO) => Promise<void>;
	editBenchmark: (updateBenchmarkDTO: UpdateBenchmarkDTO) => Promise<void>;
	deleteBenchmark: (id: number) => Promise<void>;
}

export const useBenchmarkListStore = create<BenchmarkListStore>((set, get) => ({
	benchmarks: [],
	isLoading: true,
	setBenchmarks: (benchmarks) => set({benchmarks}),
	loadBenchmarks: async () => {
		set({isLoading: true});
		try {
			const benchmarkDTOs = await benchmarkService.getAllBenchmarks();
			const benchmarks = benchmarkDTOs.map((dto) => new Benchmark(dto));
			get().setBenchmarks(benchmarks);
		} catch (error) {
			console.error('Error loading benchmarks:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to load benchmarks',
			});
		} finally {
			set({isLoading: false});
		}
	},
	addBenchmark: async (data) => {
		// set({isLoading: true});
		try {
			const newBenchmark = await benchmarkService.createBenchmark(data);
			const benchmark = new Benchmark(newBenchmark);
			get().setBenchmarks([...get().benchmarks, benchmark]);

			toast({
				title: 'Success',
				description: 'Benchmark created successfully',
			});
		} catch (error) {
			console.error('Error creating benchmark:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to create benchmark',
			});
		} finally {
			// set({isLoading: false});
		}
	},
	editBenchmark: async (updateBenchmarkDTO: UpdateBenchmarkDTO) => {
		set({isLoading: true});
		try {
			const updatedBenchmark = await benchmarkService.updateBenchmark(updateBenchmarkDTO);
			const benchmarks = get().benchmarks.map((benchmark) =>
				benchmark.id === updateBenchmarkDTO.id ? new Benchmark(updatedBenchmark) : benchmark,
			);
			get().setBenchmarks(benchmarks);

			toast({
				title: 'Success',
				description: 'Benchmark updated successfully',
			});
		} catch (error) {
			console.error('Error updating benchmark:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to update benchmark',
			});
		} finally {
			set({isLoading: false});
		}
	},
	deleteBenchmark: async (id) => {
		set({isLoading: true});
		try {
			await benchmarkService.deleteBenchmark(id);
			set((state) => ({
				benchmarks: state.benchmarks.filter((benchmark) => benchmark.id !== id),
			}));

			toast({
				title: 'Success',
				description: 'Benchmark deleted successfully',
			});
		} catch (error) {
			console.error('Error deleting benchmark:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to delete benchmark',
			});
		} finally {
			set({isLoading: false});
		}
	},
}));
