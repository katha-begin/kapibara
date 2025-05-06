?
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
   // Expose environment variables to the browser
  env: {
    // NEXT_PUBLIC_APP_ENV will be available on process.env in the browser
    // You can set this variable during your build/deployment process
    // Example: NEXT_PUBLIC_APP_ENV=staging next build
    // Defaults to NODE_ENV if not explicitly set
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV,
  },
};

export default nextConfig;
