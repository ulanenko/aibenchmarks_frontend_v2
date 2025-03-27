'use server';

import {db} from '@/db';
import {strategy, type Strategy} from '@/db/schema';
import {eq} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';

export async function getStrategies() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return {data: null, error: 'Not authenticated'};
        }

        const strategies = await db
            .select()
            .from(strategy)
            .where(eq(strategy.userId, parseInt(session.user.id)))
            .orderBy(strategy.createdAt);
        return {data: strategies, error: null};
    } catch (error) {
        console.error('Error fetching strategies:', error);
        return {data: null, error: 'Failed to fetch strategies'};
    }
}

export async function createStrategy(data: Omit<Strategy, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return {data: null, error: 'Not authenticated'};
        }

        const [newStrategy] = await db
            .insert(strategy)
            .values({
                ...data,
                userId: parseInt(session.user.id),
            })
            .returning();

        // Revalidate the strategies page to show the new strategy
        revalidatePath('/strategies');

        return {data: newStrategy, error: null};
    } catch (error) {
        console.error('Error creating strategy:', error);
        return {data: null, error: 'Failed to create strategy'};
    }
}

export async function updateStrategy(data: Strategy) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return {data: null, error: 'Not authenticated'};
        }

        // Verify that the strategy belongs to the authenticated user
        const [existingStrategy] = await db
            .select()
            .from(strategy)
            .where(eq(strategy.id, data.id))
            .limit(1);

        if (!existingStrategy) {
            return {data: null, error: 'Strategy not found'};
        }

        if (existingStrategy.userId !== parseInt(session.user.id)) {
            return {data: null, error: 'You do not have permission to update this strategy'};
        }

        // Update the strategy
        const [updatedStrategy] = await db
            .update(strategy)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(strategy.id, data.id))
            .returning();

        // Revalidate the strategies page
        revalidatePath('/strategies');

        return {data: updatedStrategy, error: null};
    } catch (error) {
        console.error('Error updating strategy:', error);
        return {data: null, error: 'Failed to update strategy'};
    }
}

export async function generateStrategyWithWizard(companyDescription: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return {data: null, error: 'Not authenticated'};
        }

        // Import the strategy wizard service
        const { strategyWizard } = await import('@/services/support-services');
        
        // Call the strategy wizard service
        const wizardResponse = await strategyWizard({
            company_description: companyDescription
        });

        if (!wizardResponse) {
            return {data: null, error: 'Failed to generate strategy'};
        }

        // Return the wizard response
        return {data: wizardResponse, error: null};
    } catch (error) {
        console.error('Error generating strategy with wizard:', error);
        return {data: null, error: 'Failed to generate strategy'};
    }
}

export async function deleteStrategy(id: number) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return {success: false, error: 'Not authenticated'};
        }

        // Verify that the strategy belongs to the authenticated user
        const [existingStrategy] = await db
            .select()
            .from(strategy)
            .where(eq(strategy.id, id))
            .limit(1);

        if (!existingStrategy) {
            return {success: false, error: 'Strategy not found'};
        }

        if (existingStrategy.userId !== parseInt(session.user.id)) {
            return {success: false, error: 'You do not have permission to delete this strategy'};
        }

        // Delete the strategy
        await db
            .delete(strategy)
            .where(eq(strategy.id, id));

        // Revalidate the strategies page
        revalidatePath('/strategies');

        return {success: true, error: null};
    } catch (error) {
        console.error('Error deleting strategy:', error);
        return {success: false, error: 'Failed to delete strategy'};
    }
} 