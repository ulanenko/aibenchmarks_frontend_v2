'use client';

import {usePathname} from 'next/navigation';
import {AuthLayout} from '@/components/layout/auth-layout';
import {AppLayout} from '@/components/layout/app-layout';

export function LayoutWrapper({children}: {children: React.ReactNode}) {
	const pathname = usePathname();
	const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');

	if (isAuthPage) {
		return <AuthLayout>{children}</AuthLayout>;
	}

	return <AppLayout>{children}</AppLayout>;
}
