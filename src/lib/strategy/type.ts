import {strategy} from '@/db/schema';
import {strategySchema, strategyBaseSchema} from './fields';
import {z} from 'zod';

export type Strategy = typeof strategy.$inferSelect;
export type StrategyNewDTO = Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>;

// Export Zod schema
export {strategySchema};

// Create types from Zod schema
export type StrategyDTO = z.infer<typeof strategySchema>;
export type StrategyCreate = Omit<StrategyDTO, 'id' | 'createdAt' | 'updatedAt'>;
export type StrategyBenchmark = z.infer<typeof strategyBaseSchema>;