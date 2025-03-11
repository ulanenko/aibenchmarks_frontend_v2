import './globals.css';
import type {Metadata} from 'next';
import localFont from 'next/font/local';
import {Providers} from '@/components/providers/providers';
import {LayoutWrapper} from '@/components/layout/layout-wrapper';
import {Toaster} from '@/components/ui/toaster';

const inter = localFont({
	src: [
		{
			path: '../fonts/Inter-Regular.woff2',
			weight: '400',
			style: 'normal',
		},
		{
			path: '../fonts/Inter-Medium.woff2',
			weight: '500',
			style: 'normal',
		},
		{
			path: '../fonts/Inter-Bold.woff2',
			weight: '700',
			style: 'normal',
		},
	],
	variable: '--font-inter',
});

export const metadata: Metadata = {
	title: 'Your App',
	description: 'Your app description',
	icons: {
		icon: [
			{url: '/favicon/favicon.svg', type: 'image/svg+xml'},
			{
				url: '/assets/svg/logos/logo-short.svg',
				type: 'image/svg+xml',
				sizes: 'any',
			},
		],
	},
};

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body className={inter.className}>
				<Providers>
					<LayoutWrapper>{children}</LayoutWrapper>
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}
