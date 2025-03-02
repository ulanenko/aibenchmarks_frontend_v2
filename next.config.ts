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
	experimental: {
		serverActions: {
			// Increase the body size limit to 10MB (or adjust as needed)
			bodySizeLimit: '10mb',
		},
	},
	/* config options here */
};

export default config;
