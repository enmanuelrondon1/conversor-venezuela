import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración existente...
  
  // Agregar esto para desarrollo
  ...(process.env.NODE_ENV === 'development' && {
    headers: async () => [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ],
  }),
};

export default nextConfig;