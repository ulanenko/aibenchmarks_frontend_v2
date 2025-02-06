'use client';

import {Toaster} from '@/components/ui/toaster';

export function AuthLayout({children}: {children: React.ReactNode}) {
	return (
		<>
			{children}
			<Toaster />
		</>
	);
}
