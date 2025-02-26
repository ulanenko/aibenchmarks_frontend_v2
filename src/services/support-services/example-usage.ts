import {aiMapper} from './index';
import {MapperInput} from './types';
import {SourceColumn as SharedSourceColumn} from '@/app/actions/dto/mapper-types';

/**
 * Example function demonstrating how to use the AI mapper service
 */
export async function exampleAiMapperUsage() {
	// Create sample input data
	const input: MapperInput = {
		sourceColumns: [
			{
				key: 'first_name',
				title: 'First Name',
				type: 'string',
				options: '',
				samples: ['John', 'Jane', 'Michael'],
			},
			{
				key: 'last_name',
				title: 'Last Name',
				type: 'string',
				options: '',
				samples: ['Smith', 'Doe', 'Johnson'],
			},
			{
				key: 'age',
				title: 'Age',
				type: 'number',
				options: '',
				samples: ['25', '30', '45'],
			},
		],
		targetOptions: [
			{
				value: 'given_name',
				label: 'Given Name',
				description: "The person's first name",
			},
			{
				value: 'family_name',
				label: 'Family Name',
				description: "The person's last name or surname",
			},
			{
				value: 'years',
				label: 'Years',
				description: "The person's age in years",
			},
		],
	};

	try {
		// Call the AI mapper service
		console.log('Calling AI mapper service...');
		const results = await aiMapper(input);

		if (results) {
			console.log('AI Mapper Results:', results);

			// Process the results
			Object.entries(results.ai_mapper_items).forEach(([key, item]) => {
				console.log(`Target: ${item.target_option_value}`);
				console.log(`Mapped to source: ${item.source_column_key}`);
				console.log(`Confidence: ${item.confidence || 'N/A'}`);
				console.log(`Explanation: ${item.explanation || 'N/A'}`);
				console.log('---');
			});
		} else {
			console.log('AI mapper service returned null. Check configuration and try again.');
		}
	} catch (error) {
		console.error('Error using AI mapper:', error);
	}
}

// To run the example, uncomment the line below
// exampleAiMapperUsage();
