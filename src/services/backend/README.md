# Backend Services

This directory contains the backend services used by the application.

## Comparability Analysis

The comparability analysis service provides functionality to retrieve and process comparability analysis results from the database.

### Comparability Analysis Results

The service fetches raw comparability analysis results from the database and transforms them into a standardized format that can be used by the frontend. The service supports three types of analysis:

1. **Product/Service Analysis** - Analyzes the comparability of products and services
2. **Function Analysis** - Analyzes the comparability of functions
3. **Independence Analysis** - Analyzes independence factors

#### Usage

To use the comparability analysis results service, you can directly use the server action:

```typescript
import { getComparabilityAnalysisResults } from '@/app/actions/comparability/results';

// Get results for a specific search ID and test type
const result = await getComparabilityAnalysisResults('search-123', 'product_service');

// Check for errors
if (result.error) {
  console.error('Error:', result.error);
} else {
  // Use the processed data
  const data = result.data;
  // ...
}
```



// The state object will be updated once the results are fetched
```

#### Data Structure

The service returns a standardized data structure:

```typescript
interface ComparabilityAnalysisResultsDTO {
    checklist: {
        acceptable: Array<{
            name: string;
            present: boolean;
            isAncillary: boolean;
        }>;
        rejectable: Array<{
            name: string;
            present: boolean;
            isAncillary: boolean;
        }>;
        other: Array<{
            name: string;
            similarTo?: string;
            isAncillary: boolean;
        }>;
    };
    conclusion: {
        status: string;
        confidence: string;
        explanation: string;
        confidenceExplanation: string;
        concerns?: string;
    };
}
``` 