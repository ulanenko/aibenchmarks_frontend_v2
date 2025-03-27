import {create} from 'zustand';
import {type Strategy} from '@/db/schema';
import {getStrategies, createStrategy, updateStrategy, deleteStrategy} from '@/app/actions/strategy';

interface StrategiesState {
    strategies: Strategy[];
    isLoading: boolean;
    error: string | null;
    fetchStrategies: () => Promise<void>;
    addStrategy: (data: Omit<Strategy, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateStrategy: (data: Strategy) => Promise<void>;
    deleteStrategy: (id: number) => Promise<{success: boolean, error: string | null}>;
}

export const useStrategiesStore = create<StrategiesState>((set, get) => ({
    strategies: [],
    isLoading: false,
    error: null,

    fetchStrategies: async () => {
        set({isLoading: true, error: null});
        try {
            const {data, error} = await getStrategies();
            if (error) {
                set({error, isLoading: false});
                return;
            }
            set({strategies: data || [], isLoading: false});
        } catch (error) {
            set({error: 'Failed to fetch strategies', isLoading: false});
        }
    },

    addStrategy: async (data) => {
        set({isLoading: true, error: null});
        try {
            const {data: newStrategy, error} = await createStrategy(data);
            if (error) {
                set({error, isLoading: false});
                return;
            }
            if (newStrategy) {
                set((state) => ({
                    strategies: [...state.strategies, newStrategy],
                    isLoading: false,
                }));
            }
        } catch (error) {
            set({error: 'Failed to create strategy', isLoading: false});
        }
    },

    updateStrategy: async (data) => {
        set({isLoading: true, error: null});
        try {
            // Update strategy via server action
            const {data: updatedStrategy, error} = await updateStrategy(data);
            
            if (error) {
                set({error, isLoading: false});
                return;
            }
            
            // Update the local state with the updated strategy
            if (updatedStrategy) {
                set((state) => ({
                    strategies: state.strategies.map(s => 
                        s.id === updatedStrategy.id ? updatedStrategy : s
                    ),
                    isLoading: false,
                }));
            }
        } catch (error) {
            set({error: 'Failed to update strategy', isLoading: false});
        }
    },

    deleteStrategy: async (id) => {
        set({isLoading: true, error: null});
        try {
            const {success, error} = await deleteStrategy(id);
            
            if (error) {
                set({error, isLoading: false});
                return {success: false, error};
            }
            
            // Remove the strategy from the local state
            if (success) {
                set((state) => ({
                    strategies: state.strategies.filter(s => s.id !== id),
                    isLoading: false,
                }));
            }
            
            return {success: true, error: null};
        } catch (error) {
            const errorMessage = 'Failed to delete strategy';
            set({error: errorMessage, isLoading: false});
            return {success: false, error: errorMessage};
        }
    },
})); 