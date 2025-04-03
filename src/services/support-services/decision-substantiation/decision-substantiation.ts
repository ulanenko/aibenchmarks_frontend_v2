import { SUPPORT_SERVICES_CONFIG } from '@/config/env';
import { 
  DecisionSubstantiationRequest, 
  DecisionSubstantiationResponse, 
  DecisionSubstantiationRawResponse 
} from './types';

/**
 * Calls the Decision Substantiation API to get substantiation for company matching decisions
 * @param input The decision substantiation request with search_id and strategy
 * @returns The decision substantiation response or null if the API call fails
 */
export async function decisionSubstantiation(
  input: DecisionSubstantiationRequest
): Promise<DecisionSubstantiationResponse | null> {
  const apiUrl = `${SUPPORT_SERVICES_CONFIG.URL}/decisions_substantiation`;
  
  try {
    // Check if the auth token is configured
    if (!SUPPORT_SERVICES_CONFIG.AUTH_TOKEN) {
      console.error('Decision Substantiation: Auth token not configured');
      return null;
    }

    console.log(`Decision Substantiation: Calling API at ${apiUrl}`);

    // Make the API call
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: SUPPORT_SERVICES_CONFIG.AUTH_TOKEN,
      },
      body: JSON.stringify(input),
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Decision Substantiation: API call failed with status ${response.status}:`, errorText);
      return null;
    }

    // Parse the raw response
    const rawResult: DecisionSubstantiationRawResponse = await response.json();
    
    // Transform snake_case to camelCase
    const result: DecisionSubstantiationResponse = {
      companyName: rawResult.company_name,
      companyDescription: rawResult.company_description,
      matchScore: rawResult.match_score,
      substantiation: rawResult.substantiation,
      functionsMatches: rawResult.functions_matches,
      productMatches: rawResult.product_matches,
    };
    
    console.log('Decision Substantiation: API call successful');
    return result;
  } catch (error) {
    console.error(`Decision Substantiation: Error calling API at ${apiUrl}:`, error);
    return null;
  }
} 