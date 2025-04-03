'use server';

import { db } from '@/db';
import { strategy } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { decisionSubstantiation, DecisionSubstantiationResponse } from '@/services/support-services';

/**
 * Get substantiation for a decision using a strategy from the database
 * @param searchId The search ID of the company
 * @param strategyId The ID of the strategy to use for substantiation
 * @returns The decision substantiation response or error
 */
export async function getDecisionSubstantiation(
  searchId: string,
  strategyId: number
): Promise<{ data: DecisionSubstantiationResponse | null; error: string | null }> {
  try {
    // Get the strategy from the database
    const [strategyData] = await db
      .select()
      .from(strategy)
      .where(eq(strategy.id, strategyId))
      .limit(1);

    if (!strategyData) {
      return { data: null, error: 'Strategy not found' };
    }

    // Create the request payload using the retrieved strategy
    const request = {
      search_id: searchId,
      strategy: {
        idealFunctionalProfile: strategyData.idealFunctionalProfile || null,
        idealProducts: strategyData.idealProducts || null,
        rejectFunctions: strategyData.rejectFunctions || null,
        rejectProducts: strategyData.rejectProducts || null,
        relaxedProduct: strategyData.relaxedProduct,
        relaxedFunction: strategyData.relaxedFunction,
        disabledIndependence: strategyData.disabledIndependence,
      }
    };

    // Call the decision substantiation service
    const response = await decisionSubstantiation(request);

    if (!response) {
      return { data: null, error: 'Failed to get decision substantiation' };
    }

    return { data: response, error: null };
  } catch (error) {
    console.error('Error getting decision substantiation:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
} 