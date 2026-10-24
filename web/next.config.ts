import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfkit', 'nodemailer'],
  outputFileTracingIncludes: { '/*': ['./src/assets/fonts/Ubuntu-R.ttf'] },
};

export default nextConfig;
