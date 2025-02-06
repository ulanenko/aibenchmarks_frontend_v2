import {NextResponse} from 'next/server';
import bcrypt from 'bcryptjs';
import {db} from '@/db';
import {user} from '@/db/schema';
import {eq} from 'drizzle-orm';

export async function POST(request: Request) {
	try {
		const json = await request.json();
		const {name, email, password} = json;

		// Validate input
		if (!name || !email || !password) {
			return NextResponse.json({error: 'Name, email and password are required'}, {status: 400});
		}

		// Check if user already exists
		const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1);

		if (existingUser.length > 0) {
			return NextResponse.json({error: 'User with this email already exists'}, {status: 400});
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const [newUser] = await db
			.insert(user)
			.values({
				name,
				email,
				password: hashedPassword,
				isAdmin: false,
			})
			.returning();

		// Remove password from response
		const {password: _, ...userWithoutPassword} = newUser;

		return NextResponse.json(userWithoutPassword, {status: 201});
	} catch (error) {
		console.error('Error registering user:', error);
		return NextResponse.json({error: 'Error registering user'}, {status: 500});
	}
}
