/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, context) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.plugins.push(
      new context.webpack.NormalModuleReplacementPlugin(
        /^node:/,
        (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        }
      )
    );

    return config;
  }
};

module.exports = nextConfig;
