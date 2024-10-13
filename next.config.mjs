/** @type {import('next').NextConfig} */
const isGithub = process.env.GITHUB_PAGES;

const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    basePath: isGithub ? '/word_counter/' : '',
    assetPrefix: isGithub ? '/word_counter/' : '',
};

export default nextConfig;
