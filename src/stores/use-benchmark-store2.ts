import {create} from 'zustand';
import {Benchmark} from '@/lib/benchmark/benchmark';
import {BenchmarkDTO, UpdateBenchmarkDTO} from '@/lib/benchmark/type';
import {toast} from '@/hooks/use-toast';
import * as benchmarkActions from '@/app/actions/benchmark-actions';

interface BenchmarkStore {
  benchmark: Benchmark | null;
  isLoading: boolean;
  setBenchmark: (benchmark: Benchmark | null) => void;
  loadBenchmark: (id: number) => Promise<void>;
  updateBenchmark: (data: UpdateBenchmarkDTO) => Promise<{benchmark: BenchmarkDTO | null}>;
}

export const useBenchmarkStore = create<BenchmarkStore>((set, get) => ({
  benchmark: null,
  isLoading: false,
  setBenchmark: (benchmark) => set({benchmark}),
  
  loadBenchmark: async (id: number) => {
    set({isLoading: true});
    try {
      const {benchmark: benchmarkDTO, error} = await benchmarkActions.getBenchmarkById(id);

      if (error) {
        throw new Error(error);
      }

      const benchmark = benchmarkDTO ? new Benchmark(benchmarkDTO) : null;
      get().setBenchmark(benchmark);
    } catch (error) {
      console.error(`Error loading benchmark with ID ${id}:`, error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load benchmark',
      });
      get().setBenchmark(null);
    } finally {
      set({isLoading: false});
    }
  },
  
  updateBenchmark: async (data: UpdateBenchmarkDTO) => {
    set({isLoading: true});
    try {
      const {benchmark: updatedBenchmark, error} = await benchmarkActions.updateBenchmark(data);

      if (error) {
        throw new Error(error);
      }

      if (updatedBenchmark) {
        get().setBenchmark(new Benchmark(updatedBenchmark));
        
        toast({
          title: 'Success',
          description: 'Benchmark updated successfully',
        });

        return {benchmark: updatedBenchmark};
      }
      return {benchmark: null};
    } catch (error) {
      console.error(`Error updating benchmark with ID ${data.id}:`, error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update benchmark',
      });
      return {benchmark: null};
    } finally {
      set({isLoading: false});
    }
  },
})); 