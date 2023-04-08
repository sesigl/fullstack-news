/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')

const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['www.freecodecamp.org',
            'fullstack-news-public-assets-15eab5f.s3.eu-central-1.amazonaws.com',
            'fullstack-news-article-assets-np-551b01a.s3.eu-central-1.amazonaws.com',
            'fullstack-news-article-assets-ef8b034.s3.eu-central-1.amazonaws.com',
            's.gravatar.com',
            'lh3.googleusercontent.com',
            'avatars.githubusercontent.com'
        ]
    },
    experimental: {
        // Required:
        appDir: true,
    },
    async rewrites() {
        return [
            {
                source: "/bee.js",
                destination: "https://cdn.splitbee.io/sb.js",
            },
            {
                source: "/_hive/:slug",
                destination: "https://hive.splitbee.io/:slug",
            },
        ];
    },
}

module.exports = withPWA({
    ...nextConfig,
    pwa: {
        dest: 'public',
        runtimeCaching
    },
    eslint: {
        dirs: ['pages', 'components', 'lib', 'libs', 'src', 'tests', 'config'] // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
    }
})
