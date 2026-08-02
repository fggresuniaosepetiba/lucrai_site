const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config) => {
    config.resolve.alias["@images"] = path.join(__dirname, "images");
    return config;
  },
};

module.exports = nextConfig;