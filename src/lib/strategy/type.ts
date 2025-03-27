import {strategy} from '@/db/schema';
import {z} from 'zod';

export type Strategy = typeof strategy.$inferSelect;
export type StrategyNewDTO = Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>;

export const strategyNewSchema = z.object({
	name: z.string(),
	idealFunctionalProfile: z.string(),
	idealProducts: z.string(),
	rejectFunctions: z.string(),
	rejectProducts: z.string(),
	relaxedProduct: z.boolean(),
	relaxedFunction: z.boolean(),
	disabledIndependence: z.boolean(),
});

export const strategySchema = strategyNewSchema.extend({
	id: z.number(),
	createdAt: z.date(),
	updatedAt: z.date().nullable(),
});

export type StrategyDTO = z.infer<typeof strategySchema>;
