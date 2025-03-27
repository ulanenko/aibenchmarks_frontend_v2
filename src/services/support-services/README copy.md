# Support Services

This directory contains services for interacting with external support services, including the AI Mapper service.

## AI Mapper Service

The AI Mapper service helps automatically map source columns (e.g., from Excel files) to target columns in our system.

### Configuration

The service requires the following environment variables:

```
SUPPORT_SERVICES_URL="https://aibenchmarks-supplementary-services.azurewebsites.net"
SUPPORT_SERVICES_AUTH_TOKEN="your-auth-token"
```

These should be set in your `.env` file.

> **Note**: The `SUPPORT_SERVICES_AUTH_TOKEN` should be provided without the "Bearer" prefix. The service will use it as-is for authentication.

### Usage

#### Server-Side (Server Actions)

The recommended way to use the AI Mapper service is through server actions:

```typescript
import {mapColumnsWithAI} from '@/app/actions/ai-mapper-actions';

// In your component
const handleAiMapping = async () => {
	const sourceColumns = [
		{key: 'first_name', title: 'First Name', sample: 'John'},
		{key: 'last_name', title: 'Last Name', sample: 'Doe'},
	];

	const targetColumns = [
		{key: 'given_name', title: 'Given Name', required: true},
		{key: 'family_name', title: 'Family Name', required: true},
	];

	const result = await mapColumnsWithAI(sourceColumns, targetColumns);

	if (result && result.mappings) {
		// Use the mappings
		console.log(result.mappings);
		// { given_name: 'first_name', family_name: 'last_name' }

		// Check if fallback was used
		if (result.usedFallback) {
			console.log('Used fallback mapping mechanism');
		}
	}
};
```

#### Direct Usage

You can also use the service directly:

```typescript
import {aiMapper, MapperInput} from '@/services/support-services';

const input: MapperInput = {
	sourceColumns: [
		{
			title: 'First Name',
			key: 'first_name',
			type: 'string',
			options: '',
			samples: ['John', 'Jane'],
		},
	],
	targetOptions: [
		{
			value: 'given_name',
			label: 'Given Name',
			description: "The person's first name",
		},
	],
};

const results = await aiMapper(input);

if (results) {
	console.log(results.ai_mapper_items);
}
```

### Data Format Requirements

The AI Mapper service has specific requirements for the input data:

1. **Sample Values**: All sample values must be strings. Numeric values will be automatically converted to strings.
2. **Column Keys**: Each source column must have a unique key.
3. **Target Values**: Each target option must have a unique value.

The service will automatically convert numeric samples to strings to avoid validation errors.

### Error Handling

The AI Mapper service includes robust error handling:

1. **Authentication Errors (401)**: If the authentication token is invalid or missing, the service will return an error. Check your `.env` file to ensure the `SUPPORT_SERVICES_AUTH_TOKEN` is correctly set.

2. **Validation Errors (400)**: If the input data format is incorrect, the service will return a validation error. Ensure your data follows the format requirements listed above.

3. **Service Unavailable**: If the AI Mapper service is unavailable or returns an error, the application will return a failure response with `success: false` and `mappings: null`.

## Troubleshooting

If you encounter issues with the AI Mapper service:

1. **401 Unauthorized**: Verify that your `SUPPORT_SERVICES_AUTH_TOKEN` in the `.env` file is correct and does not include the "Bearer" prefix.

2. **400 Bad Request**: Check that your input data follows the format requirements, particularly that all sample values are strings.

3. **Service Unavailable**: If the service is down or unreachable, the application will return a failure response. Check your network connection and the service status.
