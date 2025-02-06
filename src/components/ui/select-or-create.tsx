'use client';

import * as React from 'react';
import {Button} from '@/components/ui/button';
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {PlusCircle} from 'lucide-react';
import {type Control} from 'react-hook-form';

interface SelectOrCreateProps {
	name: string;
	label: string;
	description?: string;
	Icon?: React.ElementType;
	control: Control<any>;
	options: Array<{value: number; label: string}>;
	onCreateClick: () => void;
}

export function SelectOrCreate({name, label, Icon, description, control, options, onCreateClick}: SelectOrCreateProps) {
	return (
		<FormField
			control={control}
			name={name}
			render={({field}) => (
				<FormItem>
					<FormLabel htmlFor={name}>{label}</FormLabel>
					<div className="flex gap-2">
						<FormControl>
							<div className="relative w-full">
								{Icon && (
									<Icon
										className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
										aria-hidden="true"
									/>
								)}
								<Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || '')}>
									<SelectTrigger id={name} name={name} className={Icon ? 'pl-9' : undefined}>
										<SelectValue placeholder={`Select a ${label.toLowerCase()}`} />
									</SelectTrigger>
									<SelectContent>
										{options.map((option) => (
											<SelectItem key={option.value} value={String(option.value)}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</FormControl>
						<Button type="button" variant="outline" size="icon" title={`Create New ${label}`} onClick={onCreateClick}>
							<PlusCircle className="h-4 w-4" />
						</Button>
					</div>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
