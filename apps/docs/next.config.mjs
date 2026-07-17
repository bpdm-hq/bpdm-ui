import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Button moved from its own single-page category into Form. Keep old links
      // (and the bare category path) working with a permanent redirect.
      { source: '/docs/button/button', destination: '/docs/form/button', permanent: true },
      { source: '/docs/button', destination: '/docs/form/button', permanent: true },
    ];
  },
};

export default withMDX(config);
