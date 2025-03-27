'use client';

import {Button} from '@/components/ui/button';
import {useStrategiesStore} from '@/stores/use-strategy-list-store';
import {useEffect, useState} from 'react';
import {MoreVertical} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {StrategyFormDialog} from './strategy-form-dialog';
import type {Strategy} from '@/db/schema';
import {Switch} from '@/components/ui/switch';
import {strategyFields, strategySettings} from '@/lib/strategy/fields';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {useToast} from '@/hooks/use-toast';

// Filter out the 'name' field for the detail view
const detailFields = strategyFields.filter(field => field.key !== 'name');

export function StrategiesList() {
    const {strategies, fetchStrategies, isLoading, deleteStrategy} = useStrategiesStore();
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
    const [strategyToDelete, setStrategyToDelete] = useState<Strategy | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const {toast} = useToast();

    useEffect(() => {
        fetchStrategies();
    }, [fetchStrategies]);

    const handleSelectStrategy = (strategy: Strategy) => {
        setSelectedStrategy(strategy);
    };

    const handleConfirmDelete = async () => {
        if (!strategyToDelete) return;
        
        setIsDeleting(true);
        try {
            const result = await deleteStrategy(strategyToDelete.id);
            
            if (result.success) {
                toast({
                    title: "Strategy deleted",
                    description: `"${strategyToDelete.name}" has been deleted successfully.`,
                });
                
                // If we deleted the currently selected strategy, clear the selection
                if (selectedStrategy?.id === strategyToDelete.id) {
                    setSelectedStrategy(null);
                }
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to delete strategy",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setStrategyToDelete(null);
        }
    };

    return (
        <div className="grid grid-cols-5 gap-8">
            {/* Left panel - Strategy List */}
            <div className="col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Your Strategies</h2>
                    <StrategyFormDialog />
                </div>

                <div className="space-y-2">
                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : strategies.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">No strategies found</div>
                    ) : (
                        strategies.map((strategy) => (
                            <div
                                key={strategy.id}
                                className={`flex items-center justify-between p-4 rounded-md border transition-colors cursor-pointer ${
                                    selectedStrategy?.id === strategy.id ? 'bg-accent' : 'hover:bg-accent/50'
                                }`}
                                onClick={() => handleSelectStrategy(strategy)}
                            >
                                <span className="text-sm font-medium">{strategy.name}</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <StrategyFormDialog 
                                            strategy={strategy}
                                            trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>}
                                        />
                                        <DropdownMenuItem 
                                            className="text-destructive"
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                setStrategyToDelete(strategy);
                                            }}
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!strategyToDelete} onOpenChange={(open) => !open && setStrategyToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the strategy 
                            "{strategyToDelete?.name}" and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleConfirmDelete} 
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Right panel - Strategy Details */}
            <div className="col-span-3">
                {selectedStrategy ? (
                    <div className="rounded-lg border p-6">
                        <h2 className="text-xl font-semibold mb-6">{selectedStrategy.name}</h2>
                        
                        <div className="space-y-6">
                            {detailFields.map(field => (
                                <div key={field.key}>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{field.label}</h3>
                                    <div className="rounded-md border p-3 bg-muted/30 min-h-[40px]">
                                        {selectedStrategy[field.key as keyof Strategy] as string || "—"}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8 pt-6 border-t">
                            <h3 className="text-sm font-medium mb-4">Settings</h3>
                            <div className="space-y-4">
                                {strategySettings.map(setting => (
                                    <div key={setting.key} className="flex items-center justify-between">
                                        <span className="text-sm">{setting.label}</span>
                                        <Switch 
                                            checked={setting.inversed 
                                                ? !selectedStrategy[setting.key as keyof Strategy] 
                                                : !!selectedStrategy[setting.key as keyof Strategy]
                                            } 
                                            disabled 
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end">
                            <StrategyFormDialog 
                                strategy={selectedStrategy} 
                                trigger={<Button variant="outline" size="sm">Edit Strategy</Button>}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed p-12 text-center">
                        <h2 className="text-lg font-semibold">Select a Strategy</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Choose a strategy from the list or create a new one to view and edit its details.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 