const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@ffmpeg-installer/ffmpeg",
      "ffprobe-static",
      "fluent-ffmpeg"
    ]
  }
};

export default nextConfig;
