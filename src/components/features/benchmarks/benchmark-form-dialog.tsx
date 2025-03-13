'use client';

import * as React from 'react';
import {Button} from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {useBenchmarkListStore} from '@/stores/use-benchmark-store';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {EntityDefinition} from '@/lib/field-definition';
import {SelectOrCreate} from '@/components/ui/select-or-create';
import {BenchmarkDTO, CreateBenchmarkDTO} from '@/lib/benchmark/type';
import {benchmarkSchema, BenchmarkFields} from '@/lib/benchmark/schema-and-fields';

interface BenchmarkFormDialogProps {
	mode: 'create' | 'edit';
	benchmark?: BenchmarkDTO;
	trigger: React.ReactNode;
	onComplete?: (benchmark: BenchmarkDTO) => void;
}

const benchmarkDefinition = new EntityDefinition(benchmarkSchema, BenchmarkFields);

export function BenchmarkFormDialog({
	mode,
	benchmark: initialBenchmark,
	trigger,
	onComplete,
}: BenchmarkFormDialogProps) {
	const [open, setOpen] = React.useState(false);
	const [creatingField, setCreatingField] = React.useState<string | null>(null);
	const {addBenchmark, editBenchmark, isLoading} = useBenchmarkListStore();
	const [selectOptions, setSelectOptions] = React.useState<Record<string, Array<{value: number; label: string}>>>({});

	const form = useForm<CreateBenchmarkDTO>({
		resolver: zodResolver(benchmarkSchema),
		defaultValues: benchmarkDefinition.getDefaultValues(initialBenchmark),
		mode: 'onChange',
	});

	React.useEffect(() => {
		if (!open || typeof window === 'undefined') return;

		// Load options for all relationship fields
		Object.entries(benchmarkDefinition.fields).forEach(([field, def]) => {
			if (def.type === 'relationship' && 'options' in def) {
				def.options
					.then((options) => {
						setSelectOptions((prev) => ({
							...prev,
							[field]: options,
						}));
					})
					.catch(console.error);
			}
		});
	}, [open]);

	const onSubmit = async (data: CreateBenchmarkDTO) => {
		let result;
		if (mode === 'create') {
			result = await addBenchmark(data);
		} else if (initialBenchmark?.id) {
			result = await editBenchmark({...data, id: initialBenchmark.id});
		}
		setOpen(false);

		// Call onComplete callback if provided and we have a benchmark result
		if (onComplete && result?.benchmark) {
			onComplete(result.benchmark);
		}
	};

	const handleEntityCreated = (field: string, entity: {id: number; name: string}) => {
		setSelectOptions((prev) => ({
			...prev,
			[field]: [...(prev[field] || []), {value: entity.id, label: entity.name}],
		}));
		form.setValue(field as keyof CreateBenchmarkDTO, entity.id);
		setCreatingField(null);
	};

	const title = mode === 'create' ? 'Create Benchmark' : 'Edit Benchmark';
	const description =
		mode === 'create' ? 'Add a new benchmark to track AI model performance.' : 'Edit an existing benchmark.';

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>
				{creatingField ? (
					(() => {
						const fieldProps = benchmarkDefinition.getFieldProps(creatingField);
						if (!fieldProps || fieldProps.type !== 'relationship') return null;
						const FormComponent = fieldProps.formComponent;
						return (
							<FormComponent
								mode="embedded"
								onCreated={(entity) => handleEntityCreated(creatingField, entity)}
								onCancel={() => setCreatingField(null)}
							/>
						);
					})()
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<DialogHeader>
								<DialogTitle>{title}</DialogTitle>
								<DialogDescription>{description}</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								{(Object.keys(benchmarkSchema.shape) as Array<keyof CreateBenchmarkDTO>).map((field) => {
									const fieldProps = benchmarkDefinition.getFieldProps(field);
									if (!fieldProps) return null;
									const {icon: Icon, label, type, placeholder} = fieldProps;

									if (fieldProps.type === 'relationship') {
										return (
											<SelectOrCreate
												key={field}
												name={field}
												label={label}
												Icon={Icon}
												// description={description}
												control={form.control}
												options={selectOptions[field] || []}
												onCreateClick={() => setCreatingField(field)}
											/>
										);
									}

									return (
										<FormField
											key={field}
											control={form.control}
											name={field}
											render={({field: fieldProps}) => (
												<FormItem>
													<FormLabel htmlFor={field}>{label}</FormLabel>
													<FormControl>
														<div className="relative">
															{Icon && <Icon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />}
															<Input
																{...fieldProps}
																type={type}
																id={field}
																name={field}
																autoComplete="off"
																onChange={
																	type === 'number'
																		? (e) => fieldProps.onChange(Number(e.target.value))
																		: fieldProps.onChange
																}
																placeholder={placeholder}
																disabled={isLoading}
																className={Icon ? 'pl-9' : undefined}
															/>
														</div>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									);
								})}
							</div>
							<DialogFooter>
								<Button type="submit" disabled={isLoading || !form.formState.isValid}>
									{isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				)}
			</DialogContent>
		</Dialog>
	);
}
