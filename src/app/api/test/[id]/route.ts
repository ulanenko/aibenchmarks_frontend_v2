import {NextResponse} from 'next/server';
import {db} from '@/db';
import {test} from '@/db/schema';
import {eq} from 'drizzle-orm';

export async function PUT(request: Request, {params}: {params: {id: string}}) {
	try {
		const json = await request.json();
		const {test: testName} = json;
		const id = Number(params.id);

		if (!testName) {
			return NextResponse.json({error: 'Test name is required'}, {status: 400});
		}

		const [updatedTest] = await db.update(test).set({test: testName}).where(eq(test.id, id)).returning();

		if (!updatedTest) {
			return NextResponse.json({error: 'Test not found'}, {status: 404});
		}

		return NextResponse.json(updatedTest, {status: 200});
	} catch (error) {
		console.error('Error updating test:', error);
		return NextResponse.json({error: 'Error updating test'}, {status: 500});
	}
}

export async function DELETE(request: Request, {params}: {params: {id: string}}) {
	try {
		const id = Number(params.id);
		const [deletedTest] = await db.delete(test).where(eq(test.id, id)).returning();

		if (!deletedTest) {
			return NextResponse.json({error: 'Test not found'}, {status: 404});
		}

		return NextResponse.json(deletedTest, {status: 200});
	} catch (error) {
		console.error('Error deleting test:', error);
		return NextResponse.json({error: 'Error deleting test'}, {status: 500});
	}
}
