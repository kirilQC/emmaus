/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects(){
    return [
      { source:'/learn', destination:'/explore', permanent:true },
      { source:'/reference', destination:'/explore', permanent:true },
    ];
  },
};
export default nextConfig;
