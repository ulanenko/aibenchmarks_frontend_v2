'use client';

import {Button} from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Plus, Wand2, PenLine, Settings, HelpCircle, PencilRuler, BookCopy} from 'lucide-react';
import {Switch} from '@/components/ui/switch';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Separator} from '@/components/ui/separator';
import {useState, useEffect} from 'react';
import {useStrategiesStore} from '@/stores/use-strategy-list-store';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {strategySchema, strategyFields, strategySettings, StrategyFieldKey, StrategySettingKey} from '@/lib/strategy/fields';
import {z} from 'zod';
import type {Strategy} from '@/db/schema';
import {generateStrategyWithWizard} from '@/app/actions/strategy';
import {useToast} from '@/hooks/use-toast';
import { useBenchmarkStore } from '@/stores/use-benchmark-store';
import { StrategyBenchmark } from '@/lib/strategy/type';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the form mode enum
export enum FormMode {
    NEW = 'new',
    EDIT = 'edit',
    BENCHMARK = 'benchmark'
}

// Text dictionaries
const DIALOG_TITLES = {
    [FormMode.NEW]: 'New Strategy',
    [FormMode.EDIT]: 'Edit Strategy',
    [FormMode.BENCHMARK]: 'Set Accept/Reject Criteria'
};

const DIALOG_DESCRIPTIONS = {
    [FormMode.NEW]: 'Create a new strategy by entering details manually or using the AI assistant.',
    [FormMode.EDIT]: 'Edit your existing strategy settings.',
    [FormMode.BENCHMARK]: 'Define criteria for accepting or rejecting companies in the benchmark analysis.'
};

const SUBMIT_BUTTON_TEXT = {
    [FormMode.NEW]: 'Create Strategy',
    [FormMode.EDIT]: 'Update Strategy',
    [FormMode.BENCHMARK]: 'Save Criteria'
};

const SUBMITTING_TEXT = {
    [FormMode.NEW]: 'Creating...',
    [FormMode.EDIT]: 'Updating...',
    [FormMode.BENCHMARK]: 'Saving...'
};

type FormValues = z.infer<typeof strategySchema>;

interface StrategyFormProps {
    mode: FormMode;
    strategy?: Strategy | StrategyBenchmark; // Optional, provided in EDIT mode
    trigger?: React.ReactNode; // Optional custom trigger
    onComplete?: () => void; // Optional callback for when form is submitted
}

export function StrategyFormDialog({ mode, strategy, trigger, onComplete }: StrategyFormProps) {
    // Default to 'ai' mode for new strategies, but use 'custom' when editing an existing strategy
    const defaultMode = strategy ? 'custom' : 'ai';
    const [aiMode, setAiMode] = useState<'custom' | 'ai' | 'existing'>(defaultMode);
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiProcessed, setAiProcessed] = useState(false);
    const [selectedStrategyId, setSelectedStrategyId] = useState<number | null>(null);
    const {addStrategy, updateStrategy, strategies, fetchStrategies} = useStrategiesStore();
    const {benchmark, updateStrategyBenchmark} = useBenchmarkStore();
    const {toast} = useToast();

    // Determine if fields should be disabled based on mode and AI processing state
    const isFieldDisabled = () => {
        return (aiMode === 'ai' && !aiProcessed) || (aiMode === 'existing' && !selectedStrategyId);
    };

    // Determine if we should show the name field
    const showNameField = true; // Always show name field as requested

    // Prepare default values
    const getDefaultValues = () => {
        const defaultValues = {} as Record<string, any>;
        
        // If we're in benchmark mode and there's an existing strategy
        if (mode === FormMode.BENCHMARK && benchmark?.mappingSettings?.strategy) {
            const benchmarkStrategy = benchmark.mappingSettings.strategy as StrategyBenchmark;
            
            // Set field defaults from benchmark strategy
            strategyFields.forEach(field => {
                if (benchmarkStrategy && field.key in benchmarkStrategy) {
                    defaultValues[field.key] = benchmarkStrategy[field.key as keyof StrategyBenchmark];
                } else {
                    defaultValues[field.key] = field.type === 'textarea' ? '' : field.type === 'input' ? '' : false;
                }
            });
            
            // Set setting defaults from benchmark strategy
            strategySettings.forEach(setting => {
                if (benchmarkStrategy && setting.key in benchmarkStrategy) {
                    defaultValues[setting.key] = benchmarkStrategy[setting.key as keyof StrategyBenchmark] as boolean;
                } else {
                    defaultValues[setting.key] = setting.key === 'disabledIndependence' ? false : true;
                }
            });
            
            return defaultValues as FormValues;
        }
        
        // Normal strategy defaults (for edit or new mode)
        strategyFields.forEach(field => {
            if (strategy && field.key in strategy) {
                defaultValues[field.key] = strategy[field.key as keyof StrategyBenchmark];
            } else {
                // Use empty string or appropriate default
                defaultValues[field.key] = field.type === 'textarea' ? '' : field.type === 'input' ? '' : false;
            }
        });
        
        // Set setting defaults
        strategySettings.forEach(setting => {
            if (strategy && setting.key in strategy) {
                defaultValues[setting.key] = strategy[setting.key as keyof StrategyBenchmark] as boolean;
            } else {
                // Use defined defaults
                defaultValues[setting.key] = setting.key === 'disabledIndependence' ? false : true;
            }
        });
        
        return defaultValues as FormValues;
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(strategySchema),
        defaultValues: getDefaultValues(),
    });

    // Load existing benchmark strategy and reset form when dialog opens
    useEffect(() => {
        if (open) {
            form.reset(getDefaultValues());
            setAiProcessed(false);
            setAiPrompt('');
        }
    }, [form, strategy, benchmark, open, mode]);

    // Reset AI processed state when mode changes
    useEffect(() => {
        setAiProcessed(false);
    }, [aiMode]);

    // Load strategies when dialog opens in benchmark mode
    useEffect(() => {
        if (open && mode === FormMode.BENCHMARK) {
            fetchStrategies();
        }
    }, [open, mode, fetchStrategies]);

    // Apply selected strategy to form
    useEffect(() => {
        if (selectedStrategyId && aiMode === 'existing') {
            const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);
            if (selectedStrategy) {
                // Fill text fields from selected strategy
                form.setValue('name', selectedStrategy.name);
                form.setValue('idealFunctionalProfile', selectedStrategy.idealFunctionalProfile || '');
                form.setValue('idealProducts', selectedStrategy.idealProducts || '');
                form.setValue('rejectFunctions', selectedStrategy.rejectFunctions || '');
                form.setValue('rejectProducts', selectedStrategy.rejectProducts || '');
                
                // Fill boolean settings
                form.setValue('relaxedProduct', selectedStrategy.relaxedProduct);
                form.setValue('relaxedFunction', selectedStrategy.relaxedFunction);
                form.setValue('disabledIndependence', selectedStrategy.disabledIndependence);
            }
        }
    }, [selectedStrategyId, aiMode, strategies, form]);

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true);
        try {
            if (mode === FormMode.BENCHMARK) {
                // In benchmark mode, save the strategy to the benchmark
                const strategyData: StrategyBenchmark = {
                    name: values.name,
                    idealFunctionalProfile: values.idealFunctionalProfile || '',
                    idealProducts: values.idealProducts || '',
                    rejectFunctions: values.rejectFunctions || '',
                    rejectProducts: values.rejectProducts || '',
                    relaxedProduct: values.relaxedProduct,
                    relaxedFunction: values.relaxedFunction,
                    disabledIndependence: values.disabledIndependence,
                };
                
                const result = await updateStrategyBenchmark(strategyData);
                
                if (result.benchmark) {
                    toast({
                        title: "Success",
                        description: "Accept/Reject criteria have been updated successfully"
                    });
                } else {
                    throw new Error("Failed to update benchmark strategy");
                }
            } else if (mode === FormMode.EDIT && strategy) {
                // Update existing strategy with type-safe values
                // We need to cast the strategy to ensure we have the proper fields
                const existingStrategy = strategy as Strategy;
                const updateData: Strategy = {
                    id: existingStrategy.id,
                    userId: existingStrategy.userId,
                    createdAt: existingStrategy.createdAt,
                    updatedAt: existingStrategy.updatedAt,
                    name: values.name,
                    idealFunctionalProfile: values.idealFunctionalProfile || '',
                    idealProducts: values.idealProducts || '',
                    rejectFunctions: values.rejectFunctions || '',
                    rejectProducts: values.rejectProducts || '',
                    relaxedProduct: values.relaxedProduct,
                    relaxedFunction: values.relaxedFunction,
                    disabledIndependence: values.disabledIndependence,
                };
                
                await updateStrategy(updateData);
                toast({
                    title: "Success",
                    description: `Strategy "${values.name}" has been updated successfully`
                });
            } else {
                // Create new strategy with type-safe values
                await addStrategy({
                    name: values.name,
                    idealFunctionalProfile: values.idealFunctionalProfile || '',
                    idealProducts: values.idealProducts || '',
                    rejectFunctions: values.rejectFunctions || '',
                    rejectProducts: values.rejectProducts || '',
                    relaxedProduct: values.relaxedProduct,
                    relaxedFunction: values.relaxedFunction,
                    disabledIndependence: values.disabledIndependence,
                });
                toast({
                    title: "Success",
                    description: `Strategy "${values.name}" has been created successfully`
                });
            }
            form.reset();
            setOpen(false);
            if (onComplete) onComplete();
        } catch (error) {
            console.error(`Failed to save strategy:`, error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save strategy",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    async function processAiPrompt() {
        if (!aiPrompt.trim()) {
            console.error('Please enter a description for your strategy.');
            return;
        }

        setIsProcessingAI(true);
        try {
            // Call the strategy wizard service
            const result = await generateStrategyWithWizard(aiPrompt);
            
            if (result.error || !result.data) {
                toast({
                    title: "Error",
                    description: result.error || "Failed to generate strategy",
                    variant: "destructive"
                });
                return;
            }
            
            // Fill the form with AI generated results
            const data = result.data;
            
            if (data.idealFunctionalProfile) form.setValue('idealFunctionalProfile', data.idealFunctionalProfile);
            if (data.idealProducts) form.setValue('idealProducts', data.idealProducts);
            if (data.rejectFunctions) form.setValue('rejectFunctions', data.rejectFunctions);
            if (data.rejectProducts) form.setValue('rejectProducts', data.rejectProducts);

            // Mark AI as processed to enable field editing
            setAiProcessed(true);

            toast({
                title: "Success",
                description: "Strategy successfully generated by AI",
            });
            
        } catch (error) {
            console.error('Failed to process AI request:', error);
            toast({
                title: "Error",
                description: "An unexpected error occurred while processing your request",
                variant: "destructive"
            });
        } finally {
            setIsProcessingAI(false);
        }
    }

    // Default trigger based on mode
    const defaultTrigger = mode === FormMode.EDIT ? (
        <Button size="sm" variant="ghost">
            <PenLine className="h-4 w-4" />
        </Button>
    ) : (
        <Button size="sm" variant="default">
            <Plus className="mr-2 h-4 w-4" />
            {mode === FormMode.BENCHMARK ? 'Set Criteria' : 'Add Strategy'}
        </Button>
    );
    
    // Render form field based on field type
    const renderFormField = (field: typeof strategyFields[number]) => {
        const fieldKey = field.key as keyof FormValues;
        
        // Determine if we should add color styling based on field type
        const getColorClass = () => {
            if (field.key.includes('ideal')) {
                return 'text-green-600';
            } else if (field.key.includes('reject')) {
                return 'text-red-600';
            }
            return '';
        };
        
        return (
            <FormField
                key={field.key}
                control={form.control}
                name={fieldKey}
                render={({field: formField}) => (
                    <FormItem className={field.key !== 'name' ? "mt-6" : ""}>
                        <div className="flex items-center">
                            <FormLabel className={getColorClass()}>{field.label}</FormLabel>
                            {field.description && field.key !== 'name' && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="ml-2 h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-sm">
                                            {field.description}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        <FormControl>
                            {field.type === 'input' ? (
                                <Input
                                    placeholder={field.placeholder}
                                    disabled={field.key === 'name' ? false : isFieldDisabled()}
                                    {...formField}
                                    value={(formField.value as string) ?? ''}
                                />
                            ) : (
                                <Textarea
                                    placeholder={field.placeholder}
                                    disabled={isFieldDisabled()}
                                    {...formField}
                                    value={(formField.value as string) ?? ''}
                                />
                            )}
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle>{DIALOG_TITLES[mode]}</DialogTitle>
                    <DialogDescription>{DIALOG_DESCRIPTIONS[mode]}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col min-h-0">
                        <div className="flex-1 overflow-y-auto px-6 min-h-0">
                            <div className="space-y-6">
                                {/* Name Field - always shown */}
                                {renderFormField(strategyFields[0])} {/* Name is always the first field */}

                                <Tabs defaultValue={defaultMode} onValueChange={(value) => setAiMode(value as 'custom' | 'ai' | 'existing')}>
                                    <TabsList className={`grid w-full ${mode === FormMode.BENCHMARK ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                        <TabsTrigger value="ai">
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            AI assistant
                                        </TabsTrigger>
                                        <TabsTrigger value="custom">
                                            <PencilRuler className="w-4 h-4 mr-2" />
                                            Custom strategy
                                        </TabsTrigger>
                                        {mode === FormMode.BENCHMARK && (
                                            <TabsTrigger value="existing">
                                                <BookCopy className="w-4 h-4 mr-2" />
                                                Use existing strategy
                                            </TabsTrigger>
                                        )}
                                    </TabsList>

                                    <TabsContent value="ai" className="space-y-6 mt-6">
                                        <div className="space-y-2">
                                            <Label>Describe your strategy</Label>
                                            <Textarea
                                                placeholder="Describe your strategy in natural language and let AI help you structure it (e.g. 'I want to find companies that sell cars but not motorcycles, and are focused on distribution rather than manufacturing')"
                                                className="min-h-[120px]"
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                            />
                                            <Button 
                                                type="button" 
                                                className="mt-2" 
                                                onClick={processAiPrompt}
                                                disabled={isProcessingAI}
                                            >
                                                {isProcessingAI ? 'Processing...' : (aiProcessed ? 'Regenerate Strategy' : 'Process with AI')}
                                            </Button>
                                        </div>

                                        <Separator className="my-6" />
                                    </TabsContent>
                                    
                                    {mode === FormMode.BENCHMARK && (
                                        <TabsContent value="existing" className="space-y-6 mt-6">
                                            <div className="space-y-4">
                                                <Label>Select an existing strategy</Label>
                                                {strategies.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">No strategies found. Create a strategy first.</p>
                                                ) : (
                                                    <Select
                                                        onValueChange={(value) => setSelectedStrategyId(Number(value))}
                                                        value={selectedStrategyId ? String(selectedStrategyId) : undefined}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a strategy" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {strategies.map((s) => (
                                                                <SelectItem key={s.id} value={String(s.id)}>
                                                                    {s.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                            <Separator className="my-6" />
                                        </TabsContent>
                                    )}
                                </Tabs>

                                {/* Form Fields */}
                                <div className={isFieldDisabled() ? 'opacity-50 pointer-events-none' : ''}>
                                    {/* Content fields (excluding name) */}
                                    {strategyFields.slice(1).map(renderFormField)}

                                    {/* Advanced Settings */}
                                    <Accordion type="single" collapsible className="mt-6 pb-6">
                                        <AccordionItem value="advanced-settings">
                                            <AccordionTrigger>
                                                <div className="flex items-center">
                                                    <Settings className="h-5 w-5 mr-2 text-primary" />
                                                    <Label className="text-base text-primary hover:no-underline">Advanced Settings</Label>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-4 pt-4">
                                                    {strategySettings.map(setting => {
                                                        // Cast the setting key to a proper form field key
                                                        const settingKey = setting.key as keyof FormValues;
                                                        return (
                                                            <FormField
                                                                key={setting.key}
                                                                control={form.control}
                                                                name={settingKey}
                                                                render={({field}) => (
                                                                    <FormItem className="flex items-center justify-between">
                                                                        <div className="space-y-0.5">
                                                                            <FormLabel>{setting.label}</FormLabel>
                                                                            <FormDescription>
                                                                                {setting.description}
                                                                            </FormDescription>
                                                                        </div>
                                                                        <FormControl>
                                                                            <Switch
                                                                                checked={setting.inversed 
                                                                                    ? !(field.value as boolean) 
                                                                                    : !!(field.value as boolean)
                                                                                }
                                                                                onCheckedChange={(checked) => 
                                                                                    field.onChange(setting.inversed ? !checked : checked)
                                                                                }
                                                                                disabled={isFieldDisabled()}
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting 
                                    ? SUBMITTING_TEXT[mode]
                                    : SUBMIT_BUTTON_TEXT[mode]}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 