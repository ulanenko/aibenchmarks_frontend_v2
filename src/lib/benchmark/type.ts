import {benchmark} from '@/db/schema';
import {benchmarkSchema} from './schema-and-fields';
import {z} from 'zod';
import { StrategyBenchmark } from '../strategy/type';
export type BenchmarkDBType = typeof benchmark.$inferSelect;

// Define mapping settings type to match the Python model
export interface MappingSettings {
	dbName: string;
	sourceFileName: string;
	sourceSheet: string;
	generalMapping: {[key: string]: string};
	financialMapping: {[key: string]: string};
	pathToFile?: string;
}

// Core benchmark type with additional view properties
export interface BenchmarkDTO {
	id: number;
	name: string;
	createdAt: Date;
	updatedAt: Date | null;
	clientId: number | null;
	userId: number;
	year: number;
	lang: string | null;
	mappingSettings: MappingSettings | null;
	strategy?: StrategyBenchmark | null ;
	clientName: string | null;
	userName: string | null;
}

// Type for benchmark creation
export type CreateBenchmarkDTO = z.infer<typeof benchmarkSchema>;

// Type for benchmark update with required id and view properties
export type UpdateBenchmarkDTO = Partial<Omit<BenchmarkDBType, 'id'>> & {
	id: number;
	mappingSettings?: MappingSettings;
};
