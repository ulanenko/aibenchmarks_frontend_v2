import type {StepStatus} from '@/db/schema';

// Base type from database schema
export type StepType = {
	status: StepStatus;
	description: string;
	errors: string[];
	value: string;
};
