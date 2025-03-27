import { SUPPORT_SERVICES_CONFIG } from '@/config/env';
import { StrategyWizardRequest, StrategyWizardResponse, StrategyWizardRawResponse } from './types';

/**
 * Calls the Strategy Wizard API to generate a business model strategy based on company description
 * @param input The strategy wizard request with company description
 * @returns The strategy wizard response or null if the API call fails
 */
export async function strategyWizard(input: StrategyWizardRequest): Promise<StrategyWizardResponse | null> {
  const apiUrl = `${SUPPORT_SERVICES_CONFIG.URL}/strategy_wizard`;
  
  try {
    // Check if the auth token is configured
    if (!SUPPORT_SERVICES_CONFIG.AUTH_TOKEN) {
      console.error('Strategy Wizard: Auth token not configured');
      return null;
    }

    console.log(`Strategy Wizard: Calling API at ${apiUrl}`);

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
      console.error(`Strategy Wizard: API call failed with status ${response.status}:`, errorText);
      return null;
    }

    // Parse the raw response
    const rawResult: StrategyWizardRawResponse = await response.json();
    
    // Transform snake_case to camelCase
    const result: StrategyWizardResponse = {
      idealFunctionalProfile: rawResult.ideal_functional_profile,
      idealProducts: rawResult.ideal_products_services,
      rejectFunctions: rawResult.reject_functions_activities,
      rejectProducts: rawResult.reject_products_services,
      mostProbableLanguage: rawResult.most_probable_language,
    };
    
    console.log('Strategy Wizard: API call successful');
    return result;
  } catch (error) {
    console.error(`Strategy Wizard: Error calling API at ${apiUrl}:`, error);
    return null;
  }
} 