import type {ClientType} from '@/types/client';
import type {CompanyDTO} from '@/lib/company';
import {benchmark} from '@/db/schema';

export type BenchmarkDBType = typeof benchmark.$inferSelect;

// Core benchmark type with additional view properties
export interface BenchmarkDTO extends BenchmarkDBType {
	clientName: string | null;
	userName: string | null;
}

// Type for benchmark creation
export type CreateBenchmarkDTO = Omit<BenchmarkDBType, 'id' | 'createdAt' | 'updatedAt'>;

// Type for benchmark update

// Type for benchmark update with required id and view properties
export type UpdateBenchmarkDTO = Partial<Omit<BenchmarkDBType, 'id'>> & {
	id: number;
};
