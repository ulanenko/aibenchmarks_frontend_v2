import {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import {db} from '@/db';
import {eq} from 'drizzle-orm';
import {user} from '@/db/schema';

interface Credentials {
	email: string;
	password: string;
}

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			email: string;
			name: string;
			isAdmin: boolean;
		};
	}
	interface User {
		id: string;
		email: string;
		name: string;
		isAdmin: boolean;
	}
}

export const authOptions: NextAuthOptions = {
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/login',
	},
	providers: [
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: {label: 'Email', type: 'email'},
				password: {label: 'Password', type: 'password'},
			},
			async authorize(credentials: Credentials | undefined) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const [foundUser] = await db.select().from(user).where(eq(user.email, credentials.email)).limit(1);

				if (!foundUser) {
					return null;
				}

				const passwordMatch = await bcrypt.compare(credentials.password, foundUser.password);

				if (!passwordMatch) {
					return null;
				}

				return {
					id: foundUser.id.toString(),
					email: foundUser.email,
					name: foundUser.name,
					isAdmin: foundUser.isAdmin,
				};
			},
		}),
	],
	callbacks: {
		async jwt({token, user}) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
				token.isAdmin = user.isAdmin;
			}
			return token;
		},
		async session({session, token}) {
			if (token) {
				session.user.id = token.id as string;
				session.user.email = token.email as string;
				session.user.name = token.name as string;
				session.user.isAdmin = token.isAdmin as boolean;
			}
			return session;
		},
	},
};
