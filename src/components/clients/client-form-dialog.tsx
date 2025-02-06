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
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {ClientFields, ClientSchemaType, clientSchema} from '@/lib/client';
import {EntityDefinition} from '@/lib/field-definition';
import {ArrowLeft} from 'lucide-react';
import {createClient} from '@/services/api/clients';
import {useToast} from '@/hooks/use-toast';

interface ClientFormDialogProps {
	onCreated: (entity: {id: number; name: string}) => void;
	trigger?: React.ReactNode;
	mode?: 'standalone' | 'embedded';
	onCancel?: () => void;
}

const clientDefinition = new EntityDefinition(clientSchema, ClientFields);

export function ClientFormDialog({onCreated, trigger, mode = 'standalone', onCancel}: ClientFormDialogProps) {
	const {toast} = useToast();
	const [open, setOpen] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);

	const form = useForm<ClientSchemaType>({
		resolver: zodResolver(clientSchema),
		defaultValues: clientDefinition.getDefaultValues(),
		mode: 'onChange',
	});

	const onSubmit = async (data: ClientSchemaType) => {
		setIsLoading(true);
		try {
			const newClient = await createClient(data);
			onCreated(newClient);
			if (mode === 'standalone') setOpen(false);
			form.reset();
			toast({
				title: 'Success',
				description: 'Client created successfully',
			});
		} catch (error) {
			console.error('Error creating client:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to create client',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const formContent = (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<DialogHeader>
					{mode === 'embedded' ? (
						<div className="flex items-center gap-2">
							<Button type="button" variant="ghost" size="icon" onClick={onCancel}>
								<ArrowLeft className="h-4 w-4" />
							</Button>
							<div>
								<DialogTitle>Create New Client</DialogTitle>
								<DialogDescription>Add a new client to the system.</DialogDescription>
							</div>
						</div>
					) : (
						<>
							<DialogTitle>Create Client</DialogTitle>
							<DialogDescription>Add a new client to the system.</DialogDescription>
						</>
					)}
				</DialogHeader>
				<div className="grid gap-4 py-4">
					{(Object.keys(clientSchema.shape) as Array<keyof ClientSchemaType>).map((field) => {
						const fieldProps = clientDefinition.getFieldProps(field);
						if (!fieldProps) return null;
						const {icon: Icon, label, placeholder} = fieldProps;

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
													id={field}
													{...fieldProps}
													autoComplete="off"
													placeholder={placeholder}
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
						{isLoading ? 'Creating...' : 'Create Client'}
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);

	if (mode === 'embedded') {
		return formContent;
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>{formContent}</DialogContent>
		</Dialog>
	);
}
