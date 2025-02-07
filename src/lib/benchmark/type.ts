import {benchmark} from '@/db/schema';
import {benchmarkSchema} from './schema-and-fields';
import {z} from 'zod';
export type BenchmarkDBType = typeof benchmark.$inferSelect;

// Core benchmark type with additional view properties
export interface BenchmarkDTO extends BenchmarkDBType {
	clientName: string | null;
	userName: string | null;
}

// Type for benchmark creation
export type CreateBenchmarkDTO = z.infer<typeof benchmarkSchema>;

// Type for benchmark update

// Type for benchmark update with required id and view properties
export type UpdateBenchmarkDTO = Partial<Omit<BenchmarkDBType, 'id'>> & {
	id: number;
};
