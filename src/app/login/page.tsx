import {Metadata} from 'next';
import Image from 'next/image';
import {LoginForm} from '@/components/features/auth/login-form';

export const metadata: Metadata = {
	title: 'Login',
	description: 'Login to your account',
};

export default function LoginPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5">
			<div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
				<div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
					<div className="absolute inset-0 bg-primary" />
					<div className="relative z-20 flex items-center text-lg font-medium">
						<Image src="/assets/svg/logos/logo-short.svg" alt="Logo" width={200} height={50} priority />
					</div>
					<div className="relative z-20 mt-auto">
						<blockquote className="space-y-2">
							<p className="text-lg">
								"Benchmark your AI models with confidence. Track performance, compare results, and make data-driven
								decisions."
							</p>
							<footer className="text-sm">AI Benchmarking Platform</footer>
						</blockquote>
					</div>
				</div>
				<div className="lg:p-8">
					<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
						<div className="flex flex-col space-y-2 text-center">
							<Image
								src="/assets/svg/logos/logo.svg"
								alt="Logo"
								width={200}
								height={50}
								className="mx-auto mb-8"
								priority
							/>
							<h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
							<p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
						</div>
						<LoginForm />
					</div>
				</div>
			</div>
		</div>
	);
}
