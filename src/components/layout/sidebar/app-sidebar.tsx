'use client';

import * as React from 'react';
import {BarChart2, CheckSquare, LayoutDashboard, Users, Info, LogOut, ChevronLeft, ChevronRight} from 'lucide-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useSession, signOut} from 'next-auth/react';
import {Button} from '@/components/ui/button';
import {ThemeToggle} from '@/components/features/theme-toggle';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarRail,
	SidebarSeparator,
	useSidebar,
	SidebarGroup,
	SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {routes} from '@/lib/routes';

const navMain = [
	{
		title: 'Dashboard',
		url: routes.dashboard.home(),
		icon: LayoutDashboard,
	},
	{
		title: 'Benchmarks',
		url: routes.benchmarks.list(),
		icon: BarChart2,
	},
	{
		title: 'Criteria & Strategies',
		url: routes.strategies.list(),
		icon: CheckSquare,
	},
];

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();
	const {toggleSidebar, state} = useSidebar();
	const {data: session} = useSession();

	const handleLogout = async () => {
		await signOut({redirect: true, callbackUrl: '/login'});
	};

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<div className="relative pl-2 pr-6 py-4 group-data-[collapsible=icon]:p-0">
					<img src="/assets/svg/logos/logo.svg" alt="Logo" className="h-8 group-data-[collapsible=icon]:hidden" />
					<img
						src="/assets/svg/logos/logo-short.svg"
						alt="Logo"
						className="h-8 hidden group-data-[collapsible=icon]:block"
					/>
					<Button
						variant="outline"
						size="icon"
						className="absolute -right-[1.5rem] group-data-[state=collapsed]:right-[-2.5rem] top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border shadow-sm bg-background z-50"
						onClick={toggleSidebar}
					>
						{state === 'collapsed' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
						<span className="sr-only">Toggle Sidebar</span>
					</Button>
				</div>
			</SidebarHeader>
			<SidebarContent className="px-2">
				<SidebarGroup>
					<SidebarGroupLabel>Platform</SidebarGroupLabel>
					<SidebarMenu>
						{/* <NavMain items={navMain} /> */}
						{navMain.map(({title, url, icon: Icon}) => (
							<SidebarMenuItem key={url}>
								<SidebarMenuButton asChild isActive={pathname === url}>
									<Link href={url}>
										<Icon className="h-4 w-4" />
										<span>{title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarSeparator />
				<SidebarGroup>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link href="/group-management">
									<Users className="h-4 w-4" />
									<span>My Groups</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton>
								<Info className="h-4 w-4" />
								<span>{session?.user?.email}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton onClick={handleLogout}>
								<LogOut className="h-4 w-4" />
								<span>Logout</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<div className="flex justify-center py-2">
								<ThemeToggle />
							</div>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
