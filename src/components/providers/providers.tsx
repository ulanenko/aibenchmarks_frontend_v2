'use client';

import {SessionProvider} from 'next-auth/react';
import {ThemeProvider} from '@/components/providers/theme-provider';

// Wrapper component to conditionally disable StrictMode in development
const NoStrictMode = ({children}: {children: React.ReactNode}) => {
	return process.env.NODE_ENV === 'development' ? children : <>{children}</>;
};

export function Providers({children}: {children: React.ReactNode}) {
	return (
		<NoStrictMode>
			<SessionProvider>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					{children}
				</ThemeProvider>
			</SessionProvider>
		</NoStrictMode>
	);
}
