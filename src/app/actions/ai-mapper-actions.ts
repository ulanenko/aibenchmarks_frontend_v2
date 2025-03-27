'use server';

import {aiMapper} from '@/services/support-services/ai-mapper/ai-mapper';
import {SUPPORT_SERVICES_CONFIG} from '@/config/env';
import {MapperInput} from '@/services/support-services/website-validation/types';
import {SourceColumn, TargetColumn, MappingResult} from './dto/mapper-types';

/**
 * Server action to map columns using AI
 * @param sourceColumns The source columns with sample data
 * @param targetColumns The target columns to map to
 * @returns The mapping results and success status
 */
export async function mapColumnsWithAI(
	sourceColumns: SourceColumn[],
	targetColumns: TargetColumn[],
): Promise<MappingResult> {
	try {
		// Check if the auth token is configured
		if (!SUPPORT_SERVICES_CONFIG.AUTH_TOKEN) {
			console.error('AI Mapper: Auth token not configured');
			return {mappings: null, success: false};
		}

		// Prepare the input for the AI mapper
		const input: MapperInput = {
			sourceColumns: sourceColumns.map((col) => ({
				key: col.key,
				title: col.title,
				type: typeof col.sample === 'number' ? 'number' : 'string',
				options: '',
				samples: col.sample !== undefined ? [String(col.sample)] : undefined,
			})),
			targetOptions: targetColumns.map((col) => ({
				value: col.key,
				label: col.title,
				description: `${col.title}${col.required ? ' (Required)' : ''}`,
			})),
		};

		// Call the AI mapper service
		const result = await aiMapper(input);

		// If the AI mapper returned null, return a failure
		if (!result) {
			return {mappings: null, success: false};
		}

		// Convert the AI mapper results to a simple mapping
		const mappings: Record<string, string> = {};

		// Process the AI mapper results
		Object.entries(result.ai_mapper_items || {}).forEach(([targetKey, item]) => {
			mappings[targetKey] = item.source_column_key;
		});

		return {mappings, success: true};
	} catch (error) {
		console.error('Error in mapColumnsWithAI:', error);
		return {mappings: null, success: false};
	}
}
