'use client';

import {useState, useEffect} from 'react';
import {Company, CompanyHotCopy} from '@/lib/company/company';

interface UseDescriptionModalReturn {
	isOpen: boolean;
	company: Company | CompanyHotCopy | undefined;
	onOpenChange: (open: boolean) => void;
}

export function useDescriptionModal(): UseDescriptionModalReturn {
	const [isOpen, setIsOpen] = useState(false);
	const [company, setCompany] = useState<Company | CompanyHotCopy | undefined>(undefined);

	useEffect(() => {
		const handleOpenModal = (event: CustomEvent<{company: Company | CompanyHotCopy}>) => {
			setCompany(event.detail.company);
			setIsOpen(true);
		};

		// Add event listener for the custom event
		window.addEventListener('openDescriptionModal', handleOpenModal as EventListener);

		// Clean up the event listener when the component unmounts
		return () => {
			window.removeEventListener('openDescriptionModal', handleOpenModal as EventListener);
		};
	}, []);

	const onOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			// Reset company when modal is closed
			setCompany(undefined);
		}
	};

	return {
		isOpen,
		company,
		onOpenChange,
	};
}
