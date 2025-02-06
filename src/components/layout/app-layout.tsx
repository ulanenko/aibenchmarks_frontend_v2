'use client';

import {SidebarInset, SidebarProvider} from '@/components/ui/sidebar';
import {AppSidebar} from '@/components/layout/sidebar/app-sidebar';
import {Toaster} from '@/components/ui/toaster';

export function AppLayout({children}: {children: React.ReactNode}) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="min-w-0 max-w-full overflow-x-hidden">
				<div className="">{children}</div>
			</SidebarInset>
			<Toaster />
		</SidebarProvider>
	);
}
