import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HoneyChain',
    short_name: 'HoneyChain',
    description: 'Blockchain-based Honey Traceability',
    start_url: '/',
    display: 'standalone',
    background_color: '#fef3c7',
    theme_color: '#d97706',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
