'use client';

import * as React from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {signIn} from 'next-auth/react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {useToast} from '@/hooks/use-toast';
import {Checkbox} from '@/components/ui/checkbox';

const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
	const router = useRouter();
	const {toast} = useToast();
	const [isLoading, setIsLoading] = React.useState(false);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
			rememberMe: false,
		},
	});

	async function onSubmit(data: LoginFormValues) {
		setIsLoading(true);

		try {
			const result = await signIn('credentials', {
				email: data.email,
				password: data.password,
				redirect: false,
			});

			if (result?.error) {
				toast({
					variant: 'destructive',
					title: 'Error',
					description: 'Invalid email or password',
				});
				return;
			}

			router.refresh();
			router.push('/dashboard');
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Something went wrong. Please try again.',
			});
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
				<FormField
					control={form.control}
					name="email"
					render={({field}) => (
						<FormItem>
							<FormLabel className="text-base">Your email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="email@address.com"
									className="h-12 text-base px-4"
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({field}) => (
						<FormItem>
							<FormLabel className="text-base">Password</FormLabel>
							<FormControl>
								<Input
									type="password"
									placeholder="8+ characters required"
									className="h-12 text-base px-4"
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="rememberMe"
					render={({field}) => (
						<FormItem className="flex flex-row items-center space-x-2 space-y-0">
							<FormControl>
								<Checkbox checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
							<FormLabel className="text-base font-normal">Remember me</FormLabel>
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
					{isLoading ? 'Signing in...' : 'Sign in'}
				</Button>
			</form>
		</Form>
	);
}
