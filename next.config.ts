import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import rehypePrism from "rehype-prism-plus";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    rehypePlugins: [rehypePrism],
  },
});

export default withMDX(nextConfig);
