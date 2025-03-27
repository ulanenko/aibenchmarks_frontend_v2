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
import {Plus, Wand2, PenLine} from 'lucide-react';
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
import {useStrategiesStore} from '@/stores/strategies';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {strategySchema, strategyFields, strategySettings, StrategyFieldKey, StrategySettingKey} from '@/lib/strategy/fields';
import {z} from 'zod';
import type {Strategy} from '@/db/schema';
import {generateStrategyWithWizard} from '@/app/actions/strategy';
import {useToast} from '@/hooks/use-toast';

type FormValues = z.infer<typeof strategySchema>;

interface StrategyFormProps {
    strategy?: Strategy; // Optional, if provided we're in edit mode
    trigger?: React.ReactNode; // Optional custom trigger
    onComplete?: () => void; // Optional callback for when form is submitted
}

export function StrategyFormDialog({ strategy, trigger, onComplete }: StrategyFormProps) {
    const isEditMode = !!strategy;
    const [mode, setMode] = useState<'custom' | 'ai'>('custom');
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiProcessed, setAiProcessed] = useState(false);
    const {addStrategy, updateStrategy} = useStrategiesStore();
    const {toast} = useToast();

    // Determine if fields should be disabled based on mode and AI processing state
    const isFieldDisabled = () => {
        // Fields are disabled when:
        // 1. We're in AI mode (not in custom mode)
        // 2. AI has not yet processed and generated a strategy
        return mode === 'ai' && !aiProcessed;
    };

    // Prepare default values
    const getDefaultValues = () => {
        const defaultValues = {} as Record<string, any>;
        
        // Set field defaults
        strategyFields.forEach(field => {
            if (strategy && field.key in strategy) {
                defaultValues[field.key] = strategy[field.key as keyof Strategy];
            } else {
                // Use empty string or appropriate default
                defaultValues[field.key] = field.type === 'textarea' ? '' : field.type === 'input' ? '' : false;
            }
        });
        
        // Set setting defaults
        strategySettings.forEach(setting => {
            if (strategy && setting.key in strategy) {
                defaultValues[setting.key] = strategy[setting.key as keyof Strategy] as boolean;
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

    // Reset form when strategy changes or dialog opens
    useEffect(() => {
        if (open) {
            form.reset(getDefaultValues());
            setAiProcessed(false);
            setAiPrompt('');
        }
    }, [form, strategy, open]);

    // Reset AI processed state when mode changes
    useEffect(() => {
        setAiProcessed(false);
    }, [mode]);

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true);
        try {
            if (isEditMode && strategy) {
                // Update existing strategy with type-safe values
                await updateStrategy({
                    ...strategy,
                    name: values.name,
                    idealFunctionalProfile: values.idealFunctionalProfile || '',
                    idealProducts: values.idealProducts || '',
                    rejectFunctions: values.rejectFunctions || '',
                    rejectProducts: values.rejectProducts || '',
                    relaxedProduct: values.relaxedProduct,
                    relaxedFunction: values.relaxedFunction,
                    disabledIndependence: values.disabledIndependence,
                });
                console.log(`Strategy "${values.name}" has been updated successfully.`);
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
                console.log(`Strategy "${values.name}" has been created successfully.`);
            }
            form.reset();
            setOpen(false);
            if (onComplete) onComplete();
        } catch (error) {
            console.error(`Failed to ${isEditMode ? 'update' : 'create'} strategy:`, error);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function processAiPrompt() {
        if (!aiPrompt.trim()) {
            console.error('Please enter a description for your strategy.');
            return;
        }

        setIsSubmitting(true);
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
            
            if (data.idealFunctionalProfile) {
                form.setValue('idealFunctionalProfile', data.idealFunctionalProfile);
            }
            
            if (data.idealProducts) {
                form.setValue('idealProducts', data.idealProducts);
            }
            
            if (data.rejectFunctions) {
                form.setValue('rejectFunctions', data.rejectFunctions);
            }
            
            if (data.rejectProducts) {
                form.setValue('rejectProducts', data.rejectProducts);
            }

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
            setIsSubmitting(false);
        }
    }

    // Default trigger based on mode
    const defaultTrigger = isEditMode ? (
        <Button size="sm" variant="ghost">
            <PenLine className="h-4 w-4" />
        </Button>
    ) : (
        <Button size="sm" variant="default">
            <Plus className="mr-2 h-4 w-4" />
            Add Strategy
        </Button>
    );
    
    // Render form field based on field type
    const renderFormField = (field: typeof strategyFields[number]) => {
        return (
            <FormField
                key={field.key}
                control={form.control}
                name={field.key as StrategyFieldKey}
                render={({field: formField}) => (
                    <FormItem className={field.key !== 'name' ? "mt-6" : ""}>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                            {field.type === 'input' ? (
                                <Input
                                    placeholder={field.placeholder}
                                    disabled={field.key === 'name' ? false : isFieldDisabled()}
                                    {...formField}
                                    value={formField.value as string || ''}
                                />
                            ) : (
                                <Textarea
                                    placeholder={field.placeholder}
                                    disabled={isFieldDisabled()}
                                    {...formField}
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
                    <DialogTitle>{isEditMode ? 'Edit Strategy' : 'New Strategy'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode 
                            ? 'Edit your existing strategy settings.'
                            : 'Create a new strategy by entering details manually or using the AI assistant.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col min-h-0">
                        <div className="flex-1 overflow-y-auto px-6 min-h-0">
                            <div className="space-y-6">
                                {/* Name Field */}
                                {renderFormField(strategyFields[0])} {/* Name is always the first field */}

                                <Tabs defaultValue="custom" onValueChange={(value) => setMode(value as 'custom' | 'ai')}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="custom">Custom strategy</TabsTrigger>
                                        <TabsTrigger value="ai">
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            AI assistant
                                        </TabsTrigger>
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
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Processing...' : (aiProcessed ? 'Regenerate Strategy' : 'Process with AI')}
                                            </Button>
                                        </div>

                                        <Separator className="my-6" />
                                    </TabsContent>
                                </Tabs>

                                {/* Form Fields */}
                                <div className={isFieldDisabled() ? 'opacity-50 pointer-events-none' : ''}>
                                    {/* Content fields (excluding name) */}
                                    {strategyFields.slice(1).map(renderFormField)}

                                    {/* Advanced Settings */}
                                    <Accordion type="single" collapsible className="mt-6 pb-6">
                                        <AccordionItem value="advanced-settings">
                                            <AccordionTrigger>
                                                <Label className="text-base hover:no-underline">Advanced Settings</Label>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-4 pt-4">
                                                    {strategySettings.map(setting => (
                                                        <FormField
                                                            key={setting.key}
                                                            control={form.control}
                                                            name={setting.key as StrategySettingKey}
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
                                                    ))}
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
                                {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : 
                                    (isEditMode ? 'Update Strategy' : 'Create Strategy')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 