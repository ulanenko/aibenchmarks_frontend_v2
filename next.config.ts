import {NextConfig} from 'next';

const config: NextConfig = {
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	typescript: {
		// This will completely disable type checking during build
		// ignoreBuildErrors: true,
	},
	/* config options here */
};

export default config;
