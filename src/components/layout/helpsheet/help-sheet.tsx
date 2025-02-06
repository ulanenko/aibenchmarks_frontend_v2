'use client';

import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {HelpCircle} from 'lucide-react';

interface HelpSheetProps {
	title: string;
	children: React.ReactNode;
}

export function HelpSheet({title, children}: HelpSheetProps) {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon">
					<HelpCircle className="h-5 w-5" />
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="w-[400px] sm:w-[540px]">
				<SheetHeader>
					<SheetTitle>{title} Help</SheetTitle>
				</SheetHeader>
				<div className="mt-6 space-y-4">{children}</div>
			</SheetContent>
		</Sheet>
	);
}
