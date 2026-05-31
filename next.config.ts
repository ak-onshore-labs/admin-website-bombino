import type { NextConfig } from "next";

const websiteUrl = process.env.WEBSITE_API_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  async rewrites() {
    // Blog images live in the website's public folder. Proxy them so that
    // relative /blog-uploads/* URLs resolve correctly inside the admin panel
    // (editor previews, cover-image thumbnails).
    return [
      {
        source: "/blog-uploads/:path*",
        destination: `${websiteUrl}/blog-uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
