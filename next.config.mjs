/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects(){
    return [
      { source:'/learn', destination:'/explore#learn', permanent:true },
      { source:'/reference', destination:'/explore#reference', permanent:true },
    ];
  },
};
export default nextConfig;
