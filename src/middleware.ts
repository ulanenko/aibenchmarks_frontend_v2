import {withAuth} from 'next-auth/middleware';
import {NextRequestWithAuth} from 'next-auth/middleware';

export default withAuth(
	function middleware(request: NextRequestWithAuth) {
		// Add any custom middleware logic here if needed
		return null;
	},
	{
		callbacks: {
			authorized: ({token}) => !!token,
		},
	},
);

export const config = {
	matcher: [
		/*
		 * Match all paths except:
		 * 1. /api/auth/* (auth endpoints)
		 * 2. / (home page)
		 * 3. /login (login page)
		 * 4. /register (registration page if you have one)
		 * 5. /_next/* (Next.js internals)
		 * 6. Static files and assets:
		 *    - /favicon.ico
		 *    - /images/*
		 *    - /assets/*
		 */
		'/((?!api/auth|login|register|_next|images|assets|favicon.ico|\\.[^/]+$).*)',
	],
};
