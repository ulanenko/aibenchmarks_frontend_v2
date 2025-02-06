import {PageHeader} from '@/components/layout/page-header';
import {Metadata} from 'next';

export const metadata: Metadata = {
	title: 'Group Management',
};

const helpContent = (
	<>
		<h3 className="text-lg font-semibold">About Group Management</h3>
		<p className="text-sm text-muted-foreground">
			Manage your teams and collaborators for AI model evaluation projects.
		</p>

		<h3 className="text-lg font-semibold mt-6">Key Features</h3>
		<ul className="text-sm text-muted-foreground list-disc pl-4 space-y-2">
			<li>
				<strong>Team Creation:</strong> Create and organize teams
			</li>
			<li>
				<strong>Member Management:</strong> Add or remove team members
			</li>
			<li>
				<strong>Role Assignment:</strong> Define roles and permissions
			</li>
			<li>
				<strong>Access Control:</strong> Manage project access levels
			</li>
		</ul>

		<h3 className="text-lg font-semibold mt-6">Best Practices</h3>
		<ul className="text-sm text-muted-foreground list-disc pl-4 space-y-2">
			<li>Create teams based on project needs</li>
			<li>Regularly review team memberships</li>
			<li>Document team roles and responsibilities</li>
			<li>Maintain clear access hierarchies</li>
		</ul>
	</>
);

export default function Page() {
	return (
		<>
			<header className="border-b">
				<div className="container py-6">
					<PageHeader
						title="Group Management"
						description="Manage your teams and collaborators."
						helpContent={helpContent}
					/>
				</div>
			</header>
			<main className="flex-1">
				<div className="container py-6">
					<div className="rounded-lg border border-dashed p-12 text-center">
						<h2 className="text-lg font-semibold">Group Management Coming Soon</h2>
						<p className="text-sm text-muted-foreground mt-1">
							This section will help you manage your teams, collaborators, and access controls.
						</p>
					</div>
				</div>
			</main>
		</>
	);
}
